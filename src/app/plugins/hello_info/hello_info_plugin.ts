import { Plugins, db as klayrDB, codec } from 'klayr-sdk';
import {
	getDBInstance,
	getLastCounter,
	getLastEventHeight,
	setEventHelloInfo,
	setLastCounter,
	setLastEventHeight,
} from './db';
import { configSchema } from './schemas';
import { HelloInfoPluginConfig, Height, Counter } from './types';
import { newHelloEventSchema } from '../../modules/hello/events/new_hello';
import { Endpoint } from './endpoint';

export class HelloInfoPlugin extends Plugins.BasePlugin<HelloInfoPluginConfig> {
	public configSchema = configSchema;
	private _pluginDB!: klayrDB.Database;

	public endpoint = new Endpoint();

	public get nodeModulePath(): string {
		return __filename;
	}

	public async load(): Promise<void> {
		// loads DB instance
		this._pluginDB = await getDBInstance(this.dataPath);

		this.endpoint.init(this._pluginDB);

		setInterval(() => {
			this._syncChainEvents();
		}, this.config.syncInterval);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async unload(): Promise<void> {
		this._pluginDB.close();
	}

	private async _getLastCounter(): Promise<Counter> {
		try {
			const counter = await getLastCounter(this._pluginDB);
			return counter;
		} catch (error) {
			if (!(error instanceof klayrDB.NotFoundError)) {
				throw error;
			}
			await setLastCounter(this._pluginDB, 0);
			return { counter: 0 };
		}
	}

	private async _getLastHeight(): Promise<Height> {
		try {
			const height = await getLastEventHeight(this._pluginDB);
			return height;
		} catch (error) {
			if (!(error instanceof klayrDB.NotFoundError)) {
				throw error;
			}
			await setLastEventHeight(this._pluginDB, 0);
			return { height: 0 };
		}
	}

	private async _syncChainEvents(): Promise<void> {
		// 1. Get the latest block height from the blockchain
		const res = await this.apiClient.invoke<{ header: { height: number } }>(
			'chain_getLastBlock',
			{},
		);
		// 2. Get block height stored in the database
		const heightObj = await this._getLastHeight();
		const lastStoredHeight = heightObj.height + 1;
		const { height } = res.header;
		// 3. Loop through new blocks, starting from the lastStoredHeight + 1
		for (let index = lastStoredHeight; index <= height; index += 1) {
			const result = await this.apiClient.invoke<
				{ data: string; height: number; module: string; name: string }[]
			>('chain_getEvents', {
				height: index,
			});
			// 3a. Once an event is found, decode its data and pass it to the _saveEventInfoToDB() function
			const helloEvents = result.filter(e => e.module === 'hello' && e.name === 'newHello');
			for (const helloEvent of helloEvents) {
				const parsedData = codec.decode<{ senderAddress: Buffer; message: string }>(
					newHelloEventSchema,
					Buffer.from(helloEvent.data, 'hex'),
				);
				const { counter } = await this._getLastCounter();
				await this._saveEventInfoToDB(parsedData, helloEvent.height, counter + 1);
			}
		}
		// 4. At the end of the loop, save the last checked block height in the database.
		await setLastEventHeight(this._pluginDB, height);
	}

	private async _saveEventInfoToDB(
		parsedData: { senderAddress: Buffer; message: string },
		chainHeight: number,
		counterValue: number,
	): Promise<string> {
		// 1. Saves newly generated hello events to the database
		const { senderAddress, message } = parsedData;
		await setEventHelloInfo(this._pluginDB, senderAddress, message, chainHeight, counterValue);
		// 2. Saves incremented counter value
		await setLastCounter(this._pluginDB, counterValue);
		// 3. Saves last checked block's height
		await setLastEventHeight(this._pluginDB, chainHeight);
		return 'Data Saved';
	}
}
