import {DefaultOptionMode} from 'stylelint-rule-creator';
import {testDefaultRule} from 'stylelint-rule-creator/dist/testing';
import {pluginPath} from '../../plugin-util';
import {blockPropertiesRule, messages} from './block-properties.rule';

testDefaultRule({
    rule: blockPropertiesRule,
    pluginPath: pluginPath,
    tests: [
        {
            ruleOptions: true,
            description: 'placeholder',
            accept: [
                {
                    code: `body {color: blue;}`,
                },
            ],
            reject: [
                {
                    // by default float is blocked... just do we can have a default lol
                    code: `body {float: right;}`,
                    message: messages.propertyBlocked('float: right', 'float'),
                },
            ],
        },
        {
            ruleOptions: {
                mode: DefaultOptionMode.BLOCK,
                properties: ['font-weight'],
                detailedProperties: [
                    {
                        property: 'font-family',
                        exceptions: {
                            values: ['inherit'],
                            selectors: ['input', 'select'],
                        },
                    },
                ],
            },
            description: 'placeholder',
            accept: [
                {
                    code: `body {color: blue;}`,
                },
                {
                    // by default float is blocked... just do we can have a default lol
                    code: `body {float: right;}`,
                },
                {
                    code: `input {font-family: inherit;}`,
                },
                {
                    code: `select {font-family: inherit;}`,
                },
                {
                    code: `input, select {font-family: inherit;}`,
                },
            ],
            reject: [
                {
                    code: `body {font-family: sans-serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: sans-serif',
                        'font-family',
                        'body',
                        'sans-serif',
                    ),
                },
                {
                    code: `body {font-weight: weight;}`,
                    message: messages.propertyBlocked('font-weight: weight', 'font-weight'),
                },
                {
                    code: `body {font-family: inherit;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: inherit',
                        'font-family',
                        'body',
                        'inherit',
                    ),
                },
                {
                    code: `input {font-family: sans-serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: sans-serif',
                        'font-family',
                        'input',
                        'sans-serif',
                    ),
                },
            ],
        },
        {
            describe: 'regexp property names are blocked',
            ruleOptions: {
                mode: DefaultOptionMode.BLOCK,
                properties: [/^background.*/],
            },
            description: 'placeholder',
            accept: [
                {
                    code: `body {funky-background: blue;}`,
                },
                {
                    code: `body {color: blue;}`,
                },
            ],
            reject: [
                {
                    code: `body {background-color: blue;}`,
                    message: messages.propertyBlocked('background-color: blue', 'background-color'),
                },
                {
                    code: `body {background: blue;}`,
                    message: messages.propertyBlocked('background: blue', 'background'),
                },
            ],
        },
        {
            describe: 'can make it allowed for @rules',
            ruleOptions: {
                mode: DefaultOptionMode.BLOCK,
                properties: [],
                detailedProperties: [
                    {
                        property: /^font-.*/,
                        exceptions: {
                            selectors: ['@font-face'],
                        },
                    },
                ],
            },
            description: 'placeholder',
            accept: [
                {
                    code: `@font-face {font-family: serif;}`,
                },
            ],
            reject: [
                {
                    code: `body {font-family: serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: serif',
                        'font-family',
                        'body',
                        'serif',
                    ),
                },
            ],
        },
        {
            describe: "nested rules don't cause issues",
            ruleOptions: {
                mode: DefaultOptionMode.BLOCK,
                properties: [/^background.*/],
                detailedProperties: [
                    {
                        property: /^font-.*/,
                        exceptions: {
                            values: ['inherit', /@derp.*/],
                            selectors: ['input', 'select', /vir-*/],
                        },
                    },
                ],
            },
            linterOptions: {
                syntax: 'less' as const,
            },
            description: 'placeholder',
            accept: [
                {
                    code: `body {funky-background: blue;}`,
                },
                {
                    code: `body { input {font-family: inherit;} }`,
                },
            ],
            reject: [
                {
                    code: `body {background-color: blue;}`,
                    message: messages.propertyBlocked('background-color: blue', 'background-color'),
                },
                {
                    code: `body { div {background: blue;} }`,
                    message: messages.propertyBlocked('background: blue', 'background'),
                },
                {
                    code: `body { div {font-family: serif;} }`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: serif',
                        'font-family',
                        'div',
                        'serif',
                    ),
                },
            ],
        },
        {
            describe: 'regexp detailed properties are blocked as well as plain properties',
            ruleOptions: {
                mode: DefaultOptionMode.BLOCK,
                properties: [/^background.*/, 'float'],
                detailedProperties: [
                    {
                        property: /^font-.*/,
                        exceptions: {
                            values: ['inherit', /@derp.*/],
                            selectors: ['input', 'select', /vir-*/],
                        },
                    },
                ],
            },
            description: 'placeholder',
            accept: [
                {
                    code: `body {funky-background: blue;}`,
                },
                {
                    code: `body {color: blue;}`,
                },
                {
                    code: `body {fake-font: blue;}`,
                },
                {
                    code: `input {font-family: inherit;}`,
                },
                {
                    code: `input {font-family: @derp-doo;}`,
                },
                {
                    code: `vir-derp {font-family: inherit;}`,
                },
                {
                    code: `vir-derp {font-family: @derp-doo;}`,
                },
            ],
            reject: [
                {
                    code: `body {background-color: blue;}`,
                    message: messages.propertyBlocked('background-color: blue', 'background-color'),
                },
                {
                    code: `body {background: blue;}`,
                    message: messages.propertyBlocked('background: blue', 'background'),
                },
                {
                    code: `body {float: right;}`,
                    message: messages.propertyBlocked('float: right', 'float'),
                },
                {
                    code: `body {font-family: serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: serif',
                        'font-family',
                        'body',
                        'serif',
                    ),
                },
                {
                    code: `body {font-size: 5px;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-size: 5px',
                        'font-size',
                        'body',
                        '5px',
                    ),
                },
            ],
        },
        {
            ruleOptions: {
                mode: DefaultOptionMode.BLOCK,
                properties: ['font-weight'],
                detailedProperties: [
                    {
                        property: 'font-family',
                        exceptions: {
                            values: ['inherit'],
                            selectors: ['input', 'select'],
                        },
                    },
                    {
                        property: 'font-family',
                        exceptions: {
                            values: ['sans-serif'],
                            selectors: ['body'],
                        },
                    },
                ],
            },
            description: 'placeholder',
            accept: [
                {
                    code: `body {color: blue;}`,
                },
                {
                    // by default float is blocked... just so we can have a default lol
                    code: `body {float: right;}`,
                },
                {
                    code: `input {font-family: inherit;}`,
                },
                {
                    code: `select {font-family: inherit;}`,
                },
                {
                    code: `input, select {font-family: inherit;}`,
                },
                {
                    code: `body {font-family: sans-serif;}`,
                },
            ],
            reject: [
                {
                    code: `input {font-family: sans-serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: sans-serif',
                        'font-family',
                        'input',
                        'sans-serif',
                    ),
                },
                {
                    code: `body {font-family: serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: serif',
                        'font-family',
                        'body',
                        'serif',
                    ),
                },
                {
                    code: `body {font-family: inherit;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: inherit',
                        'font-family',
                        'body',
                        'inherit',
                    ),
                },
                {
                    code: `input {font-family: sans-serif;}`,
                    message: messages.detailedPropertyBlocked(
                        'font-family: sans-serif',
                        'font-family',
                        'input',
                        'sans-serif',
                    ),
                },
            ],
        },
    ].map((test) => {
        return {
            ...test,
            reject: test.reject.map((rejection) => ({
                ...rejection,
                message: rejection.message + ` (${blockPropertiesRule.ruleName})`,
            })),
        };
    }),
});
