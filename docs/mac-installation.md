M2 (macOS 15.1)

- Install [nvm](https://github.com/nvm-sh/nvm) (**use Node v18**)
- Install [pyenv](https://github.com/pyenv/pyenv)

```
// this will reset on cli close
eval "$(pyenv init -)"
```

```
pyenv install 3.10
pyenv global 3.10
```

Install dependencies

```
brew install autoconf automake libtool python-setuptools
```

```
yarn global add node-gyp
yarn global add klayr-commander
```

```
klayr init
```

(not needed)
If this does not work you can try to install the klayr-commander locally in an npm project:

```
npm init -y
npm install klayr-commander
npx klayr-commander init
```
