use serde;
use std::fs::{create_dir_all, File};
use std::{collections::HashSet, io::Read, path::PathBuf};
use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct PathData {
    pub raw: String,
    pub name: String,
    pub dir: String,
    pub ext: String,
    pub separator: String,
}

pub fn parse_path_data(path: &PathBuf) -> PathData {
    let raw = path.to_string_lossy().to_string();
    let name = path
        .file_stem()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let ext = path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let dir = path
        .parent()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| String::new());
    let separator = std::path::MAIN_SEPARATOR.to_string();
    PathData {
        raw,
        name,
        dir,
        ext,
        separator,
    }
}

pub fn prepend_appdata_storage_to_path(
    app_handle: &tauri::AppHandle,
    path: &PathBuf,
) -> Result<PathBuf, String> {
    let appdata_dir = get_appdata_dir(app_handle)?;
    let mut full_path = PathBuf::new();

    full_path.push(&appdata_dir);
    full_path.push("storage".to_owned());
    full_path.push(path);
    return Ok(full_path);
}

pub fn get_storage_file_text(
    app_handle: &tauri::AppHandle,
    relative_path: &PathBuf,
) -> Result<String, String> {
    let full_path = prepend_appdata_storage_to_path(app_handle, relative_path)?;

    // Open the file, and return any error up the call stack
    let mut file = File::open(full_path).map_err(|e| e.to_string())?;

    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| e.to_string())?;

    return Ok(contents);
}

pub fn get_storage_file_json<T>(
    app_handle: &tauri::AppHandle,
    relative_path: &PathBuf,
) -> Result<T, String>
where
    T: serde::de::DeserializeOwned,
{
    let json_str = get_storage_file_text(app_handle, relative_path)?;
    return serde_json::from_str(json_str.as_str())
        .map_err(|e| format!("error opening {:#?}: {e}", relative_path));
}

pub fn get_appdata_dir(app_handle: &tauri::AppHandle) -> Result<String, String> {
    // Open the file, and return any error up the call stack
    let path_buf_o = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    return match path_buf_o.to_str() {
        Some(path_buf) => Ok(path_buf.to_owned()),
        None => Err("Invalid appdata path".to_owned()),
    };
}

pub fn dedupe_paths(paths: Vec<PathData>) -> Vec<PathData> {
    let mut seen = HashSet::new();
    paths
        .into_iter()
        .filter(|path| seen.insert(path.raw.clone()))
        .collect()
}

pub fn create_openhome_directory(app_handle: &tauri::AppHandle) -> Result<(), String> {
    let appdata_dir = get_appdata_dir(app_handle)?;
    let mut full_path = PathBuf::new();

    full_path.push(appdata_dir);
    full_path.push("storage".to_owned());

    create_dir_all(full_path).map_err(|e| e.to_string())?;
    Ok(())
}
