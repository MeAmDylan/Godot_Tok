#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeUpdateStatus {
    supported: bool,
    configured: bool,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeUpdateInfo {
    available: bool,
    version: Option<String>,
    notes: Option<String>,
}

#[cfg(desktop)]
fn updater_public_key() -> Option<&'static str> {
    option_env!("GODOTTOK_UPDATER_PUBLIC_KEY").filter(|key| !key.trim().is_empty())
}

#[tauri::command]
fn native_update_status() -> NativeUpdateStatus {
    NativeUpdateStatus {
        supported: cfg!(desktop),
        configured: cfg!(desktop)
            && option_env!("GODOTTOK_UPDATER_PUBLIC_KEY")
                .is_some_and(|key| !key.trim().is_empty()),
    }
}

#[tauri::command]
async fn check_native_update(app: tauri::AppHandle) -> Result<NativeUpdateInfo, String> {
    #[cfg(desktop)]
    {
        if updater_public_key().is_none() {
            return Err("Native updates are not configured for this build.".into());
        }
        let update = app
            .updater()
            .map_err(|error| error.to_string())?
            .check()
            .await
            .map_err(|error| error.to_string())?;
        return Ok(match update {
            Some(update) => NativeUpdateInfo {
                available: true,
                version: Some(update.version.to_string()),
                notes: update.body,
            },
            None => NativeUpdateInfo {
                available: false,
                version: None,
                notes: None,
            },
        });
    }

    #[cfg(mobile)]
    {
        let _ = app;
        Err("Native self-update is available on desktop builds only.".into())
    }
}

#[tauri::command]
async fn install_native_update(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(desktop)]
    {
        if updater_public_key().is_none() {
            return Err("Native updates are not configured for this build.".into());
        }
        let update = app
            .updater()
            .map_err(|error| error.to_string())?
            .check()
            .await
            .map_err(|error| error.to_string())?
            .ok_or_else(|| "No native update is available.".to_string())?;
        update
            .download_and_install(|_, _| {}, || {})
            .await
            .map_err(|error| error.to_string())?;
        app.restart();
    }

    #[cfg(mobile)]
    {
        let _ = app;
        Err("Native self-update is available on desktop builds only.".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            native_update_status,
            check_native_update,
            install_native_update
        ]);

    #[cfg(desktop)]
    let builder = builder.setup(|app| {
        if let Some(public_key) = updater_public_key() {
            app.handle().plugin(
                tauri_plugin_updater::Builder::new()
                    .pubkey(public_key)
                    .build(),
            )?;
        }
        Ok(())
    });

    builder
        .run(tauri::generate_context!())
        .expect("error while running GodotTok");
}
