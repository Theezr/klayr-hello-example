## SSH instructions

### Example of container setup

```
Your container:
IP:  23.876.234.65
User: root
Password: een-heel-veilig-password
Dashboard url: https://{YOUR_NAME}.klayr.run
Chain url: wss://{YOUR_NAME}-chain.klayr.run/rpc-ws
```

### SSH into server (You can skip this step if you already have an SSH server installed)

- Install Remote - SSH (vsCode extension)
- Open extensions in vsCode
- Open SSH Config File
- Enter your SSH server details

```
// EXAMPLE
Host dev-container-user
  HostName 23.876.234.65
  User root
```

- Save the file
- Enter container
- Select platform => Linux => Continue
- Enter password => een-heel-veilig-password
- Open folder => click ".." => dev-container => OK => enter
- Open terminal

### Get started with klayr-dev-container

1. SSH into your dev container mentioned above
2. Run `klayr init` to get started
3. Adjust rpc and plugins config;

```
"rpc": {
    "modes": ["ipc", "ws", "http"],
    "port": 7887,
    "host": "0.0.0.0",
    "allowedMethods": ["*"]
  },
 "plugins": {
    "dashboard": {
      "host": "0.0.0.0",
      "applicationUrl": "wss://klayr-chain.klayr.run/rpc-ws" // !YOUR Chain URL!
    }
  }
```

3. Run to start the blockchain with the dashboard plugin enabled and custom config

```
./bin/run start --enable-dashboard-plugin --config config/default/config.json --overwrite-config
```

4. access dashboard with your dashboard url
