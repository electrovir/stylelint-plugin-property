import {DefaultOptionMode, testDefaultRule} from 'stylelint-rule-creator';
import {pluginPath} from '../../plugin-util';
import {blockPropertyRule, messages} from './block-property.rule';

testDefaultRule({
    rule: blockPropertyRule,
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
                message: rejection.message + ` (${blockPropertyRule.ruleName})`,
            })),
        };
    }),
});
