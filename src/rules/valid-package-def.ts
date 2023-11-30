"use strict";
import { PJV as PackageValidator } from "package-json-validator";

import { createRule } from "../createRule.js";

// package-json-validator does not correctly recognize shorthand for repositories and alternate dependency statements, so we discard those values.
// it also enforces a stricter code for NPM than is really appropriate,
// so we disable some other errors here.
const unusedErrorPatterns = [
	/^Url not valid/i,
	/^Invalid version range for .+?: file:/i,
	/^author field should have name/i,
];

const isUsableError = (errorText: string) =>
	unusedErrorPatterns.every((pattern) => !pattern.test(errorText));

export default createRule({
	create(context) {
		return {
			"Program:exit"() {
				const validation = PackageValidator.validate(
					context.sourceCode.text,
				) as PackageValidator.ValidationSuccessResult;

				validation.errors?.filter(isUsableError).forEach((message) => {
					if (message) {
						context.report({
							message,
							node: context.sourceCode.ast,
						});
					}
				});
			},
		};
	},

	meta: {
		docs: {
			category: "Best Practices",
			description:
				"Enforce that package.json has all properties required by NPM spec",
			recommended: true,
		},
	},
});