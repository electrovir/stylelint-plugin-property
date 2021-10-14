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
                    message: messages.propertyBlocked('font-family: sans-serif', 'font-family'),
                },
                {
                    code: `body {font-weight: weight;}`,
                    message: messages.propertyBlocked('font-weight: weight', 'font-weight'),
                },
                {
                    code: `body {font-family: inherit;}`,
                    message: messages.propertyBlocked('font-family: inherit', 'font-family'),
                },
                {
                    code: `input {font-family: sans-serif;}`,
                    message: messages.propertyBlocked('font-family: sans-serif', 'font-family'),
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
                    message: messages.propertyBlocked('font-family: sans-serif', 'font-family'),
                },
                {
                    code: `body {font-family: serif;}`,
                    message: messages.propertyBlocked('font-family: serif', 'font-family'),
                },
                {
                    code: `body {font-family: inherit;}`,
                    message: messages.propertyBlocked('font-family: inherit', 'font-family'),
                },
                {
                    code: `input {font-family: sans-serif;}`,
                    message: messages.propertyBlocked('font-family: sans-serif', 'font-family'),
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
