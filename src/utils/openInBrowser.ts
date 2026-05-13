import { Linking } from "react-native";

export type OpenInBrowserResult = {
  opened: boolean;
  reason?: string;
};

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export async function openInBrowser(url: string): Promise<OpenInBrowserResult> {
  if (!isAbsoluteUrl(url)) {
    return {
      opened: false,
      reason: "Hanya absolute URL (http/https) yang bisa dibuka di browser.",
    };
  }

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return { opened: true };
  }

  return {
    opened: false,
    reason: "URL tidak bisa dibuka di perangkat ini.",
  };
}
