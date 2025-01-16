import { Page, Layout, Card, FormLayout, TextField, Button, Select, ColorPicker, Text, Grid, Box } from "@shopify/polaris";
import { useState, useCallback } from "react";

export default function AnnouncementBanner() {
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState({
    hue: 300,
    brightness: 1,
    saturation: 0.7,
    alpha: 0.7
  });
  const [textColor, setTextColor] = useState({
    hue: 0,
    brightness: 0,
    saturation: 0,
    alpha: 1
  });
  const [position, setPosition] = useState('top');

  const handlePositionChange = useCallback(
    (value: string) => setPosition(value),
    [],
  );

  const positionOptions = [
    {label: 'Top', value: 'top'},
    {label: 'Bottom', value: 'bottom'},
  ];

  return (
    <Page
      title="Announcement Banner"
      backAction={{ content: "Banner Types", url: "/app/campaign/banner_type" }}
      primaryAction={{
        content: "Save Banner",
        onAction: () => {
          console.log("Banner saved");
        },
      }}
    >
    
    </Page>
  );
}
