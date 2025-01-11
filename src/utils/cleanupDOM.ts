/**
 * Removes the copy buttons and actions wrappers added by this plugin, and restores the edit block
 * button to its original position as a direct child of the `.cm-callout` element.
 */
export function removeCopyButtonsAndRestoreEditBlockButton(): void {
  document.querySelectorAll(".callout-action-buttons").forEach((wrapper) => {
    const editBlockButton = wrapper.querySelector(".edit-block-button");
    moveEditBlockButtonOutOfWrapper(editBlockButton);
    wrapper.remove();
  });
  document.querySelectorAll(".callout-copy-button").forEach((button) => {
    button.remove();
  });
}

function moveEditBlockButtonOutOfWrapper(editBlockButton: Element | null): void {
  if (editBlockButton === null) {
    return;
  }
  const cmCalloutParent = editBlockButton.closest(".cm-callout");
  if (cmCalloutParent === null) {
    return;
  }
  cmCalloutParent.appendChild(editBlockButton);
}
