# XEN-Claim-Bot

XEN-Claim-Bot is an automated robot tool for claiming XEN. Due to the significant fluctuations in Gwei value on the EVM network, controlling the cost of claiming XEN is especially important during times of low Gwei. This is particularly important for users with a large number of wallet addresses, as completing this process can require a significant amount of time and effort. XENClaimBot was designed and developed specifically for this scenario.

If you use XEN-Claim-Bot to perform the operation, you only need to import the wallet information that needs to be claimed, set the maximum acceptable Gwei value for the Claim XEN process, and specify the wallet address receive the XEN. The script will execute automatically during the process, including only necessary RPC connections with EVM nodes, and running locally in the user's browser.

## Project Setup

```sh
yarn install
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
