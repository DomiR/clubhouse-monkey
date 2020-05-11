// ==UserScript==
// @name         Clubhouse improvements
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Improve clubhouse
// @author       Dominique
// @match        https://app.clubhouse.io/thingos/*
// @grant        none
// ==/UserScript==

(function () {
	'use strict';

	const flags = {
		// Uses blue instad of purple colors
		shouldUseThingOSColors: true,

		// Adds ch prefix to the shown id and also copies it on click
		shouldPrefixStoryIdWithCh: true,

		// Replace the github dropdown with single click copy message: "title [closes id]"
		shouldReplaceGithubButtonWithCommitMessageCopy: true,
		shouldLowercaseCommitMessage: true,
	};

	jQuery(document).ready(function () {
		// Set thingos color
		if (flags.shouldUseThingOSColors) {
			let root = document.documentElement;
			root.style.setProperty('--leftSubNavBackgroundColor', '#002562');
			root.style.setProperty('--topNavBackgroundColor', '#00358E');
			root.style.setProperty('--leftNavBackgroundColor', '#265EBF');
			root.style.setProperty('--leftNavActiveBackgroundColor', '#00358E');
			root.style.setProperty('--topNavLinkBackgroundColor', '#659BF2');
			root.style.setProperty('--fadedTextColor', '#444');
		}

		// When clicking github helper it should copy `${title} [closes ch${clubhhouseid}]`
		function replaceGithubButton() {
			const githubButton = jQuery('#story-dialog-parent .story-details #open-git-helpers-dropdown');
			if (githubButton.length > 0) {
				githubButton.removeAttr('data-on-click');
				githubButton.click(() => {
					const storyTitleNode = jQuery('#story-dialog-parent .story-details .story-name');
					const storyTitle = storyTitleNode.text();

					const storyIdInput = jQuery('#story-dialog-parent .story-details .story-id input');
					const storyId = storyIdInput.val();
					const id = storyId.indexOf('ch') === -1 ? `ch{storyId}` : storyId;
					const commitMessage = `${storyTitle} [closes ${id}]`;
					const copyContent = flags.shouldLowercaseCommitMessage
						? commitMessage.toLowerCase()
						: commitMessage;
					navigator.clipboard.writeText(copyContent).catch(() => {});
				});
			}
		}

		// Setup modal change listener
		function prependStoryId() {
			const storyIdInput = jQuery('#story-dialog-parent .story-details .story-id input');
			const storyId = storyIdInput.val();
			if (typeof storyId === 'string' && storyId.indexOf('ch') === -1) {
				storyIdInput.val(`ch${storyId}`);
			}
		}

		// Check modal changes
		function checkModalChanges() {
			const storyIdInput = jQuery('#story-dialog-parent .story-details .story-id input');
			const storyId = storyIdInput.val();
			if (typeof storyId === 'string' && storyId.indexOf('ch') === -1) {
				if (flags.shouldPrefixStoryIdWithCh) {
					prependStoryId();
				}

				if (flags.shouldReplaceGithubButtonWithCommitMessageCopy) {
					replaceGithubButton()
				}
			}
		}

		// Modal fixes
		function updateModal() {
			// Prepend `ch` to story id
			const storyIdInput = jQuery('#story-dialog-parent .story-details .story-id input');
			if (storyIdInput.length > 0) {
				// we fix the id, but clubhouse will fetch and replace our fix
				// so we also start a check interval and replace it again
				setInterval(checkModalChanges, 1000);
			}
		}

		// Call this observer whenever a modal is shown
		var observer = new MutationObserver(updateModal);
		observer.observe(document.body, { subtree: false, attributes: true });
	});
})();
