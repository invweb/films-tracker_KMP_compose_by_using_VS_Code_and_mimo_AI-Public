package com.films.shared.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

@Composable
actual fun AsyncImage(
    url: String?,
    contentDescription: String?,
    modifier: Modifier
) {
    Box(
        modifier = modifier.background(DarkSurface),
        contentAlignment = Alignment.Center
    ) {
        androidx.compose.material3.Text(
            text = contentDescription?.take(1) ?: "?",
            color = Muted,
        )
    }
}
