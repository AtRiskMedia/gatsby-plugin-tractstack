module.exports = {
    "env": {
        "node": true
    },
    "extends": [
        "eslint:recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
    },
    "plugins": [
        "react-hooks"
    ],
}
