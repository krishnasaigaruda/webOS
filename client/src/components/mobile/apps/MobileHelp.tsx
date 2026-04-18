import React from 'react';
import { WindowState } from '../../../store/useStore';

const MobileHelp: React.FC<{ window: WindowState }> = () => {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f2f2f7', color: '#1c1c1e' }}>
      <div style={{ padding: '20px 16px', background: '#fff', borderBottom: '1px solid #e5e5ea' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>webOS Help</h1>
        <p style={{ fontSize: 14, color: '#8e8e93', marginTop: 4 }}>iPad and iPhone Guide</p>
      </div>

      <Section title="Getting Started">
        <Item title="How do I use webOS on iPad?" body="webOS runs in Safari on your iPad. Your Mac hosts the server, and the iPad connects over Wi-Fi. Everything you do is saved on your Mac." />
        <Item title="Where are my files?" body="All files live on your Mac at ~/webOS-<your-name>/. You can see them in macOS Finder. On iPad, use the Files app in webOS to browse them." />
        <Item title="How do I import photos?" body="Open the Files app in webOS, tap Import, then choose 'Choose Photos and Videos'. Pick photos from your iPad and they'll upload to your Mac." />
      </Section>

      <Section title="Navigation">
        <Item title="How do I go back?" body="Tap the floating back arrow in the top-left corner of any app to return to the home screen." />
        <Item title="How do I open Control Center?" body="Tap the Wi-Fi and battery icons in the top-right corner of the screen, or swipe down from the top edge." />
        <Item title="How do I sign out?" body="Open Control Center and tap Sign Out at the bottom." />
      </Section>

      <Section title="Apps">
        <Item title="Why is Camera not working?" body="Camera requires HTTPS to work on iPad/iPhone. When accessing webOS over plain HTTP (http://192.168...), iOS blocks camera access. This is an iOS security requirement." />
        <Item title="Why are some Mac apps missing?" body="Apps like Terminal, Code Editor, and Music are designed for Mac and don't work well on touch screens, so they're hidden on iPad/iPhone." />
        <Item title="How do Notes work?" body="Notes are stored in your iPad's browser storage. They persist across sessions but may be cleared if you clear Safari data." />
        <Item title="Do reminders work when the app is closed?" body="Yes. As long as webOS is open in Safari, reminders fire even if the Reminders app itself is closed. You'll hear a chime and see a notification." />
      </Section>

      <Section title="Files and Storage">
        <Item title="Will importing duplicate my files?" body="No. webOS checks for existing files with the same name and skips duplicates." />
        <Item title="Can I create folders?" body="Folders are managed on the Mac side. Use macOS Finder to organize folders, and they'll appear in webOS." />
        <Item title="Are my changes permanent?" body="Yes. When you delete or rename a file in webOS, it changes the actual file on your Mac. Be careful — there's no undo." />
      </Section>

      <Section title="Troubleshooting">
        <Item title="webOS won't load on my iPad" body="Make sure both devices are on the same Wi-Fi. Check that the server is running on your Mac (node index.js + npm start). Try http://<mac-ip>:3000 in Safari." />
        <Item title="Videos show a black screen" body="Make sure the video file exists in your webOS folder on the Mac. Some video formats may not be supported by Safari." />
        <Item title="The keyboard keeps popping up" body="Tap anywhere outside an input field to dismiss the keyboard. webOS auto-dismisses it when you tap buttons." />
      </Section>

      <div style={{ height: 40 }} />
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 13, color: '#8e8e93', padding: '16px 16px 8px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{title}</div>
    <div style={{ background: '#fff' }}>{children}</div>
  </div>
);

const Item: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f2f2f7' }}>
    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 13, color: '#8e8e93', lineHeight: 1.55 }}>{body}</div>
  </div>
);

export default MobileHelp;
