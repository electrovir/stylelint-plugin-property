# Stylelint Plugin Property

[![tests](https://github.com/electrovir/stylelint-plugin-property/actions/workflows/virmator-tests.yml/badge.svg?branch=master)](https://github.com/electrovir/stylelint-plugin-property/actions/workflows/virmator-tests.yml)

Stylelint plugin for managing arbitrary properties.

# Rules

Go to each rule's page (click on the name below) to see specific details.

| Rule                                           | auto-fix   |
| ---------------------------------------------- | ---------- |
| [plugin-property/property](src/rules/property) | no &cross; |

# Rule Options

All rules respect the following primary option format with _no_ secondary options:

-   boolean input

    ```javascript
    {
        "rule-name": true // use default rule behavior
    }
    ```

    ```javascript
    {
        "rule-name": false // disables rule
    }
    ```

-   object input

    ```javascript
    {
        "mode": "require" // requires the rule's default
    }
    ```

    ```javascript
    {
        "mode": "block" // blocks the rule's default
    }
    ```

    ```javascript
    {
        "mode": "off" // disable rule
    }
    ```

-   object input with exceptions

    ```javascript
    {
        "mode": "require",
        // optional input
        // these use glob matching with globstar turned ON
        "fileExceptions": [
            "**/*colors.less", // ignores any files ending in colors.less in any directory
            "*colors.less" // ignore files ending in colors.less only in the current directory
        ]
        // optional input
        // these use glob matching with globstar turned OFF
        "lineExceptions": [
            "*colors*", // ignores all lines that include the word colors
            "@import 'colors'" // ignores all lines that are exactly this string (don't include semicolons)
        ],
    }
    ```
