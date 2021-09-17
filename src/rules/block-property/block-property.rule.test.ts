import {testDefaultRule} from 'stylelint-rule-creator';
import {pluginPath} from '../../plugin-util';
import {blockPropertyRule} from './block-property.rule';

testDefaultRule({
    rule: blockPropertyRule,
    pluginPath: pluginPath,
    tests: [
        {
            ruleOptions: true,
            description: 'placeholder',
            accept: [{code: `body {font-family: sans-serif;}`}],
            reject: [],
        },
    ],
});
