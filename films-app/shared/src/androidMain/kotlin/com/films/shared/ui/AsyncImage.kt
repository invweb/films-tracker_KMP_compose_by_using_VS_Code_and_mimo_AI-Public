package com.films.shared.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import coil.compose.AsyncImage as CoilAsyncImage
import coil.request.ImageRequest
import androidx.compose.ui.platform.LocalContext

@Composable
actual fun AsyncImage(
    url: String?,
    contentDescription: String?,
    modifier: Modifier
) {
    val imageUrl = getImageUrl(url)
    val context = LocalContext.current

    if (imageUrl != null) {
        CoilAsyncImage(
            model = ImageRequest.Builder(context)
                .data(imageUrl)
                .crossfade(true)
                .allowHardware(false)
                .build(),
            contentDescription = contentDescription,
            modifier = modifier.background(DarkSurface),
            contentScale = androidx.compose.ui.layout.ContentScale.Crop,
        )
    } else {
        PlaceholderImage(contentDescription, modifier)
    }
}

private fun getImageUrl(path: String?): String? {
    if (path == null) return null
    if (path.startsWith("http")) return path
    return "https://image.tmdb.org/t/p/w500$path"
}

@Composable
private fun PlaceholderImage(contentDescription: String?, modifier: Modifier) {
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
