package com.films.shared.ui

import java.util.Locale

actual fun getPlatformLocale(): String {
    return Locale.getDefault().language
}
