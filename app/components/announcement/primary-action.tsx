import {ActionList, Button, ButtonGroup, Popover} from "@shopify/polaris";
import {ChevronDownIcon} from "@shopify/polaris-icons";
import React, {useEffect, useState} from "react";

export default function PrimaryAnnouncementAction(props: {
  onPublish: () => Promise<void>
  onSaveAsDraft: () => Promise<void>
  isLoading: boolean
  onLoading: (isLoading: boolean) => void
}) {
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(props.isLoading)
  }, [props.isLoading]);
  return (
    <ButtonGroup variant="segmented">
      <Button
        variant="primary"
        onClick={async () => {
          props.onLoading(true)
          await props.onPublish()
          props.onLoading(false)
        }}
        disabled={isLoading}
      >
        Publish
      </Button>

      <Popover
        active={isOpenPopover}
        preferredAlignment="right"
        activator={
          <Button
            variant="primary"
            onClick={() => {
              setIsOpenPopover(true)
            }}
            disabled={isLoading}
            icon={ChevronDownIcon}
            accessibilityLabel="Other save actions"
          />
        }
        autofocusTarget="first-node"
        onClose={() => {
          setIsOpenPopover(false)
        }}
      >
        <ActionList
          actionRole="menuitem"
          items={[{
            content: 'Save as draft',
            onAction: async () => {
              props.onLoading(true)
              await props.onSaveAsDraft()
              props.onLoading(false)
            },
            disabled: isLoading
          }]}
        />
      </Popover>
    </ButtonGroup>
  )
}
