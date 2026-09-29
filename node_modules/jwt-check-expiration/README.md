# jwt-check-expiration

## Purpose

Determine if a JWT is expired in the client without requiring a secret, this is for client use only and not intended for secure validation of the JWT. Only as a convenience method to avoid a network call if the JWT has indicated that it has expired.

## Installation

`npm install jwt-check-expiration`

## Usage

Determine if the JWT has expired in the client application when no validation is required and you do not want to expose the secret.

## Important

Only use this when security is not important, such as when you only want to save a network request before having to refresh a token.  In the event the JWT was modified and the expiration was invalid, the worst case scenario is that you will make an unnessary network request which should refresh the token anyways in your setup.

## Parameters

JWT Token

## Example

```js
import { isJwtExpired } from 'jwt-check-expiration';

console.log('isExpired is:', isJwtExpired('your-token-here'));
```
