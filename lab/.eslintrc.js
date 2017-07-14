// organize file better and change to JSON
// look at how to enforce unix line endings
module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": ["eslint:recommended"],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "indent": [
            "error",
            2,
            {"SwitchCase": 1}
        ],
        /*"linebreak-style": [
            "error",
            "unix"
        ],*/
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        //"jsx-quotes": ["error", "prefer-double"],
        //"no-multi-spaces": ["error"],
        // react-specific rules
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        "react/jsx-indent": ["error", 2],
        "react/require-render-return": ["error"],
        "react/jsx-wrap-multilines": ["error"],
        "react/jsx-closing-bracket-location": "error",
        "react/prefer-es6-class": "error",
        //"react/no-multi-comp": ["warn"],
        //"react/prefer-stateless-function": ["warn"],
        "react/jsx-pascal-case": ["error", { allowAllCaps: false, ignore: [] }],
        "react/jsx-closing-bracket-location": ["error"],
        "react/jsx-tag-spacing": ["error"],
        //"react/jsx-curly-spacing": ["error", {"when": "never"}],
        "react/jsx-boolean-value": ["error","never"],
        "react/self-closing-comp": ["error"],
        //"react/jsx-no-bind": ["error"],
        "react/sort-comp": ["warn"],
        "react/no-is-mounted": ["error"]
    }
};