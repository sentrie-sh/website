// SPDX-FileCopyrightText: © 2026 Binaek Sarkar <binaek89@gmail.com>
// SPDX-License-Identifier: Apache-2.0

// Code block theme for sentrie.sh. Code sits on Onyx in light and dark mode,
// with the syntax colors listed in DESIGN.md. Every syntax color is at least
// 4.5:1 against Onyx.

const onyx = "#282c33";
const midnight = "#2f343e";
const text = "#dce0e5";
const comment = "#9396a3";
const string = "#a1c181";
const keyword = "#d87c81";
const type = "#dec184";
const fn = "#6eb4bf";
const variable = "#bc80d6";
const constant = "#bf956a";
const operator = "#a3a9b5";

export const sentrieCodeTheme = {
	name: "sentrie-onyx",
	type: "dark",
	colors: {
		"editor.background": onyx,
		"editor.foreground": text,
		"editor.selectionBackground": "#3b4a66",
		"editorLineNumber.foreground": "#5d636f",
		"editorGroupHeader.tabsBackground": midnight,
		"tab.activeBackground": onyx,
		"tab.activeForeground": text,
		"tab.inactiveBackground": midnight,
		"tab.activeBorderTop": "#1a6ae0",
		"titleBar.activeBackground": midnight,
		"terminal.background": onyx,
		"terminal.foreground": text,
	},
	tokenColors: [
		{ scope: ["comment", "punctuation.definition.comment"], settings: { foreground: comment } },
		{ scope: ["string", "string.quoted", "string.template"], settings: { foreground: string } },
		{
			scope: ["constant.character.escape", "string.regexp"],
			settings: { foreground: fn },
		},
		{
			scope: ["keyword", "keyword.control", "storage.modifier", "storage.type.function"],
			settings: { foreground: keyword },
		},
		{
			scope: [
				"keyword.operator",
				"operator",
				"punctuation.accessor",
				"punctuation.separator",
				"punctuation.definition",
				"punctuation.markup",
			],
			settings: { foreground: operator },
		},
		{
			scope: [
				"keyword.operator.boolean",
				"keyword.operator.comparison",
				"keyword.operator.state",
				"keyword.operator.lambda",
				"keyword.operator.new",
				"keyword.operator.expression",
			],
			settings: { foreground: keyword },
		},
		{
			scope: [
				"storage.type",
				"entity.name.type",
				"entity.name.class",
				"entity.name.namespace",
				"support.type",
				"support.class",
			],
			settings: { foreground: type },
		},
		{
			scope: ["entity.name.function", "support.function", "meta.function-call"],
			settings: { foreground: fn },
		},
		{ scope: ["entity.name.tag"], settings: { foreground: fn } },
		{
			scope: ["variable.other", "variable.parameter", "variable.other.readwrite"],
			settings: { foreground: variable },
		},
		{ scope: ["variable.other.property", "meta.object-literal.key"], settings: { foreground: text } },
		{
			scope: ["constant", "constant.numeric", "constant.language", "support.constant"],
			settings: { foreground: constant },
		},
		{ scope: ["entity.name.tag.toml", "support.type.property-name"], settings: { foreground: keyword } },
		{ scope: ["markup.inserted"], settings: { foreground: string } },
		{ scope: ["markup.deleted"], settings: { foreground: keyword } },
	],
};
