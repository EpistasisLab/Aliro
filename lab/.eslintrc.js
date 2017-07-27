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
        /* JAVASCRIPT RULES */
        // Enforce consistent indentation
        "indent": [
            "error",
            2,
            {"SwitchCase": 1}
        ],
        // Enforce the consistent use of either backticks, double, or single quotes
        "quotes": [
            "error",
            "single"
        ],
        //  Require semicolons instead of ASI (automatic semicolon insertion)
        "semi": [
            "error",
            "always"
        ],
        // Disallow multiple spaces
        "no-multi-spaces": [
            "warn"
        ],
        // Enforce consistent spacing inside braces
        "object-curly-spacing": [
            "warn",
            "always"
        ],
        // Require Variable Declarations to be at the top of their scope 
        "vars-on-top": [
            "warn"
        ],
        // Require === and !==
        "eqeqeq": [
            "error"
        ],

        /* REACT-SPECIFIC RULES */
        // Enforces consistent naming for boolean props (not released yet)
        /*"react/boolean-prop-naming": [
            "warn"
        ],*/
        // Enforce all defaultProps have a corresponding non-required PropType
        "react/default-props-match-prop-types": [
            "warn"
        ],
        // Forbid certain props on Components (className, style)
        /*"react/forbid-component-props": [
            "warn"
        ],*/
        // Prevent usage of Array index in keys
        "react/no-array-index-key": [
            "error"
        ],
        // Prevent passing of children as props
        "react/no-children-prop": [
            "error"
        ],
        // Prevent usage of dangerous JSX properties
        "react/no-danger": [
            "error"
        ],
        // Prevent problem with children and props.dangerouslySetInnerHTML
        "react/no-danger-with-children": [
            "error"
        ],
        // Prevent usage of deprecated methods (set React version in shared settings or use default)
        "react/no-deprecated": [
            "error"
        ],
        // Prevent usage of setState in componentDidMount
        "react/no-did-mount-set-state": [
            "error"
        ],
        // Prevent usage of setState in componentDidUpdate
        "react/no-did-update-set-state": [
            "error"
        ],
        // Prevent usage of setState in componentWillUpdate
        "react/no-will-update-set-state": [
            "error"
        ],
        // Prevent direct mutation of this.state
        "react/no-direct-mutation-state": [
            "error"
        ],
        // Prevent usage of findDOMNode (will be deprecated)
        "react/no-find-dom-node": [
            "error"
        ],
        // Prevent usage of isMounted (will be deprecated)
        "react/no-is-mounted": [
            "error"
        ],
        // Prevent multiple component definition per file
        "react/no-multi-comp": [
            "warn",
            {"ignoreStateless": true}
        ],
        // Prevent usage of the return value of React.render
        "react/no-render-return-value": [
            "error"
        ],
        // Prevents common casing typos (not released yet)
        /*"react/no-typos": [
            "error"
        ],*/
        // Prevent invalid characters from appearing in markup
        "react/no-unescaped-entities":[
            "error"
        ],
        // Prevent usage of unknown DOM property
        "react/no-unknown-property": [
            "error"
        ],
        // Enforce ES5 or ES6 class for React Components
        "react/prefer-es6-class": [
            "error",
            "always"
        ],
        // Prevent definitions of unused prop types
        "react/no-unused-prop-types": [
            "warn"
        ],
        // Enforce stateless React Components to be written as a pure function
        "react/prefer-stateless-function": [
            "warn"
        ],
        // Prevent missing props validation in a React component definition
        "react/prop-types": [
            "warn"
        ],
        // Prevent missing React when using JSX
        "react/react-in-jsx-scope": [
            "error"
        ],
        // Enforce ES5 or ES6 class for returning value in render function
        "react/require-render-return": [
            "error"
        ],
        // Prevent extra closing tags for components without children
        "react/self-closing-comp": [
            "error"
        ],
        // Enforce component methods order (formatting preference)
        "react/sort-comp": [
            "warn"
        ],
        // Prevent void DOM elements (e.g. <img />, <br />) from receiving children
        "react/void-dom-elements-no-children": [
            "error"
        ],

        /* JSX-SPECIFIC RULES */
        // Enforce boolean attributes notation in JSX
        "react/jsx-boolean-value": [
            "error",
            "never"
        ],
        // Validate closing bracket location in JSX
        "react/jsx-closing-bracket-location": [
            "error"
        ],
        // Validate closing tag location in JSX
        "react/jsx-closing-tag-location": [
            "error"
        ],
        // Enforce or disallow spaces inside of curly braces in JSX attributes and expressions
        "react/jsx-curly-spacing": [
            "error", 
            {"when": "never"}
        ],
        // Enforce or disallow spaces around equal signs in JSX attributes
        "react/jsx-equals-spacing": [
            "error", 
            "never"
        ],
        // Restrict file extensions that may contain JSX
        "react/jsx-filename-extension": [
            "error"
        ],
        // Configure the position of the first property
        "react/jsx-first-prop-new-line": [
            "error"
        ],
        // Enforce event handler naming conventions in JSX
        "react/jsx-handler-names": [
            "warn"
        ],
        // Validate JSX indentation (DO NOT REMOVE: must be enabled)
        "react/jsx-indent": [
            "error", 
            2
        ],
        // Validate props indentation in JSX
        "react/jsx-indent-props": [
            "error",
            2
        ],
        // Detect missing key prop
        "react/jsx-key": [
            "error"
        ],
        // Limit maximum of props on a single line in JSX
        "react/jsx-max-props-per-line": [
            "warn",
            { "maximum": 5 }
        ],
        // No .bind() or Arrow Functions in JSX Props
        /*"react/jsx-no-bind": [
            "error"
        ],*/
        // Prevent comments from being inserted as text nodes
        "react/jsx-no-comment-textnodes": [
            "error"
        ],
        // Prevent duplicate properties in JSX
        "react/jsx-no-duplicate-props": [
            "error"
        ],
        // Prevent usage of string literals in JSX
        "react/jsx-no-literals": [
            "warn"
        ],
        // Prevent usage of unsafe target='_blank'
        "react/jsx-no-target-blank": [
            "error"
        ],
        // Disallow undeclared variables in JSX
        "react/jsx-no-undef": [
            "error"
        ],
        // Enforce PascalCase for user-defined JSX components
        "react/jsx-pascal-case": [
            "error", 
            { allowAllCaps: false }
        ],
        // Validate whitespace in and around the JSX opening and closing brackets
        "react/jsx-tag-spacing": [
            "error"
        ],
        // Prevent React to be incorrectly marked as unused (DO NOT REMOVE: must be enabled)
        "react/jsx-uses-react": [
            "error"
        ],
        // Prevent variables used in JSX to be incorrectly marked as unused (DO NOT REMOVE: must be enabled)
        "react/jsx-uses-vars": [
            "error"
        ],
        // Prevent missing parentheses around multiline JSX
        "react/jsx-wrap-multilines": [
            "error"
        ],
        // Enforce the consistent use of either double or single quotes in JSX attributes
        "jsx-quotes": [
            "error", 
            "prefer-double"
        ]
    }
};