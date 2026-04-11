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
  'universal-preview': UniversalPreviewApp,
  'tools-hub': ToolsHubApp,
  'data-analyzer': DataAnalyzerApp,
};

const AppRenderer: React.FC<{ window: WindowState }> = ({ window: win }) => {
  const Component = APP_COMPONENTS[win.appId];
  if (!Component) {
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
  }
  return <Component window={win} />;
};

export default AppRenderer;
