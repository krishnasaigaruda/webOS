import React from 'react';
import { WindowState } from '../../store/useStore';
import FinderApp from './FinderApp';
import TextEditApp from './TextEditApp';
import CodeEditorApp from './CodeEditorApp';
import TerminalApp from './TerminalApp';
import CalculatorApp from './CalculatorApp';
import CalendarApp from './CalendarApp';
import RemindersApp from './RemindersApp';
import ToDoApp from './ToDoApp';
import NotesApp from './NotesApp';
import ClockApp from './ClockApp';
import WeatherApp from './WeatherApp';
import PhotosApp from './PhotosApp';
import BrowserApp from './BrowserApp';
import SettingsApp from './SettingsApp';
import AIChatApp from './AIChatApp';
import DictionaryApp from './DictionaryApp';
import SpreadsheetApp from './SpreadsheetApp';
import PresentationApp from './PresentationApp';
import DocumentApp from './DocumentApp';
import CameraApp from './CameraApp';
import MusicApp from './MusicApp';
import MapsApp from './MapsApp';
import ActivityMonitorApp from './ActivityMonitorApp';
import AppStoreApp from './AppStoreApp';
import UniversalPreviewApp from './UniversalPreviewApp';
import ToolsHubApp from './ToolsHubApp';
import DataAnalyzerApp from './DataAnalyzerApp';
import HelpApp from './HelpApp';
import ModelViewerApp from './ModelViewerApp';
import VideoPlayerApp from './VideoPlayerApp';
import ToolsIframeApp from './ToolsIframeApp';
import { AppIcon } from '../../utils/icons';

const APP_COMPONENTS: Record<string, React.FC<{ window: WindowState }>> = {
  'finder': FinderApp,
  'textedit': TextEditApp,
  'code-editor': CodeEditorApp,
  'terminal': TerminalApp,
  'calculator': CalculatorApp,
  'calendar': CalendarApp,
  'reminders': RemindersApp,
  'todo': ToDoApp,
  'notes': NotesApp,
  'clock': ClockApp,
  'weather': WeatherApp,
  'photos': PhotosApp,
  'browser': BrowserApp,
  'settings': SettingsApp,
  'ai-chat': AIChatApp,
  'dictionary': DictionaryApp,
  'spreadsheet': SpreadsheetApp,
  'presentation': PresentationApp,
  'document': DocumentApp,
  'camera': CameraApp,
  'music': MusicApp,
  'maps': MapsApp,
  'activity-monitor': ActivityMonitorApp,
  'app-store': AppStoreApp,
  'help': HelpApp,
  'model-viewer': ModelViewerApp,
  'video-player': VideoPlayerApp,
  'universal-preview': UniversalPreviewApp,
  'tools-hub': ToolsHubApp,
  'data-analyzer': DataAnalyzerApp,
};

// Tools Hub apps that can be installed from the App Store
const TOOLS_HUB_APPS: Record<string, string> = {
  'typing-test': 'typing-test.html',
  'drawing-pad': 'drawing-pad.html',
  'whiteboard': 'whiteboard.html',
  'quiz': 'quiz.html',
  'periodic-table': 'periodic-table.html',
  'metronome': 'metronome.html',
  'password-gen': 'password-gen.html',
  'qr-generator': 'qr-generator.html',
  'translator': 'translator.html',
  'coin-flip': 'coin-flip.html',
  'dice-roller': 'dice-roller.html',
  'graph-plotter': 'graph-plotter.html',
  'voice-recorder': 'voice-recorder.html',
  'tuner': 'tuner.html',
};

const ToolsHubWrapper: React.FC<{ window: WindowState; file: string }> = ({ window: win, file }) => (
  <ToolsIframeApp window={win} src={`/repos/Tools-Hub/tools/${file}`} />
);

const AppRenderer: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const Component = APP_COMPONENTS[win.appId];
  if (Component) return <Component window={win} />;

  // Check if it's a Tools Hub app
  const toolsFile = TOOLS_HUB_APPS[win.appId];
  if (toolsFile) return <ToolsHubWrapper window={win} file={toolsFile} />;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', color: 'var(--text-secondary)', flexDirection: 'column', gap: 12,
      background: 'var(--window-content)',
    }}>
      <AppIcon appId={win.appId} size={64} />
      <span style={{ fontSize: 14 }}>App "{win.appId}" is not installed</span>
      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Check the App Store for available apps</span>
    </div>
  );
};

export default AppRenderer;
