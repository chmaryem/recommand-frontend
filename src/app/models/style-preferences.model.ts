export interface StylePreferences {
  styleVestimentaire: string;
  otherPreferences?: string[];
  couleursFavorites?: string[];
  taille?: string;
  budget?: string;
  notificationsActivees?: boolean;
  heureNotification?: string;
  occasionsFrequentes?: string[];
}

export interface SavePreferencesResponse {
  success: boolean;
  message: string;
  data: StylePreferences;
}