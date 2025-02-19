import {Button, Card, Page, Text} from "@shopify/polaris";
import image from "../../assets/onboarding.png";
import {useNavigate} from "@remix-run/react";


export default function EmptyHome() {
  const navigate = useNavigate();
  return (
    <Page
      title="Welcome to HexStore - Announcement Bar"
    >
      <Card>
        <div
          style={{display: 'flex', justifyContent: 'center', width: '100%', paddingTop: '40px', paddingBottom: '64px'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '400px'}}>
            <img src={image} alt="onboarding"/>
            <Text variant="headingMd" alignment={"center"} as="h2">{`'Online store dashboard'}`}</Text>
            <div style={{height: '6px'}}/>
            <Text as={'h3'} alignment="center">Your one stop solution for announcement which will increase your sale as
              well as your impression..</Text>
            <div style={{height: '16px'}}/>
            <Button variant={'primary'} onClick={()=>{
              navigate("/app/campaign/banner_type");
            }} >Let's get started</Button>
          </div>
        </div>
      </Card>
    </Page>
  )
}
