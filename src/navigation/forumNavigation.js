// Forum screens can also be opened from links or notifications, where there
// may be no prior screen in this navigator. Avoid dispatching an unhandled
// GO_BACK action in that case and return the user to the community tab.
export function returnToCommunity(navigation) {
  if (navigation?.canGoBack?.()) {
    navigation.goBack();
    return;
  }

  navigation?.navigate?.('MainTabs', { screen: 'Community' });
}
