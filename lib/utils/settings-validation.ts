import type { Settings } from '../types/database';

/**
 * Checks if all essential settings have been configured by the user.
 * Essential settings are those required before the app can be used effectively.
 */
export function areEssentialSettingsConfigured(settings: Settings | null): boolean {
    if (!settings) return false;

    return (
        settings.weekly_target > 0 &&
        settings.base_commission_rate > 0 &&
        settings.current_shift !== null
    );
}
