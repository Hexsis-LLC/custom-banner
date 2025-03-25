import {TextField} from "@shopify/polaris";

export function AnnouncementTitle(props: { value: string, onChange?: (value: string) => void, errors?: string }) {
  return <TextField
    label="Campaign Title"
    autoComplete="off"
    placeholder="Campaign Title"
    value={props.value}
    onChange={props.onChange}
    error={props.errors}
  />
}
