import { app, autoUpdater, dialog } from 'electron';
import Updater from 'update-electron-app';
import Logger from 'electron-log';
import { createAppWindow, createOverlayWindow, WindowType } from './windows';
import { RROx } from './rrox';
import { ChangeSwitchAction, EnsureInGameAction, InjectDLLAction, MinizwergColorsAction, MinizwergUploadAction, ReadAddressAction, ReadAddressValueAction, ReadPlayerAddress, ReadWorldAction, SaveAction, SetEngineControlsAction, SetMoneyAndXPAction, TeleportAction } from './actions';
import { AttachTask, AutosaveTask, LoggerTask, OverlayTask, ReadWorldTask } from './tasks';
import { AutosaveIPCListener, ChangeSwitchIPCListener, GetAttachedStateIPCHandler, GetSocketStateIPCHandler, GetVersionIPCHandler, KillDanglingInjector, MapDataIPCHandler, MinizwergColorsIPCHandler, OpenLogIPCListener, PathDataIPCHandler, SetAttachedStateIPCListener, SetEngineControlsIPCListener, SetMoneyAndXPIPCListener, SetSocketStateIPCHandler, TeleportIPCListener, UpdateConfigIPCListener } from './ipc';
import './types';

const singleInstanceLock = process.env.NODE_ENV === 'development' ? true : app.requestSingleInstanceLock();

/** Handle creating/removing shortcuts on Windows when installing/uninstalling. */
if ( require( 'electron-squirrel-startup' ) || !singleInstanceLock) {
    app.quit();
} else {
    Updater( {
        logger    : Logger,
        notifyUser: false, // We manually notify the user with a custom message
    } );

    autoUpdater.on( 'update-downloaded', ( event, releaseNotes, releaseName, releaseDate, updateURL ) => {
        Logger.log( 'update-downloaded', [ event, releaseNotes, releaseName, releaseDate, updateURL ] )

        const dialogOpts = {
            type: 'info',
            buttons: [ 'Restart', 'Later' ],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version is available. Before updating, please shut down the game, if it is running.'
        }

        dialog.showMessageBox( dialogOpts ).then( ( { response } ) => {
            if ( response === 0 ) autoUpdater.quitAndInstall()
        } )
    } );

    let rrox: RROx;
    app.on( 'ready', async () => {
        rrox = new RROx();

        rrox.addWindow( WindowType.App    , createAppWindow    () );
        rrox.addWindow( WindowType.Overlay, createOverlayWindow() );

        // Initialize all actions
        const actions = [
            ChangeSwitchAction,
            EnsureInGameAction,
            InjectDLLAction,
            MinizwergColorsAction,
            MinizwergUploadAction,
            ReadAddressAction,
            ReadAddressValueAction,
            ReadPlayerAddress,
            ReadWorldAction,
            SaveAction,
            SetEngineControlsAction,
            SetMoneyAndXPAction,
            TeleportAction
        ];
        rrox.createActions( actions );

        // Initialize all tasks and autostart all (except for attach)
        const tasks = [
            AttachTask,
            AutosaveTask,
            ReadWorldTask,
            LoggerTask,
            OverlayTask
        ];
        rrox.createTasks( tasks );
        await rrox.startTasks( tasks.filter( ( t ) => t !== AttachTask ) );

        // Initialize and start all IPC tasks
        const ipc = [
            AutosaveIPCListener,
            ChangeSwitchIPCListener,
            GetAttachedStateIPCHandler,
            GetSocketStateIPCHandler,
            GetVersionIPCHandler,
            KillDanglingInjector,
            MapDataIPCHandler,
            MinizwergColorsIPCHandler,
            OpenLogIPCListener,
            PathDataIPCHandler,
            SetAttachedStateIPCListener,
            SetEngineControlsIPCListener,
            SetMoneyAndXPIPCListener,
            SetSocketStateIPCHandler,
            UpdateConfigIPCListener,
            TeleportIPCListener,
        ];
        rrox.createTasks( ipc );
        await rrox.startTasks( ipc );
    } );

    app.on( 'second-instance', () => {
        let window = rrox?.getWindow(WindowType.App);
        if (window) {
            if (window.isMinimized()) {
                window.restore();
            }

            window.focus();
        }
    });

    app.on( 'window-all-closed', () => {
        app.quit();
    } );
}