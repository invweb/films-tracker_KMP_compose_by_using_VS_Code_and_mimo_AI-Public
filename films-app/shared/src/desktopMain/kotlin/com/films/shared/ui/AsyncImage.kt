package com.films.shared.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.loadImageBitmap
import io.ktor.client.HttpClient
import io.ktor.client.request.get
import io.ktor.client.statement.readBytes

@Composable
actual fun AsyncImage(
    url: String?,
    contentDescription: String?,
    modifier: Modifier
) {
    val imageUrl = getImageUrl(url)
    var bitmap by remember { mutableStateOf<ImageBitmap?>(null) }
    var isError by remember { mutableStateOf(false) }

    LaunchedEffect(imageUrl) {
        if (imageUrl == null) {
            isError = true
            return@LaunchedEffect
        }
        try {
            val client = HttpClient()
            val bytes = client.get(imageUrl).readBytes()
            client.close()
            bitmap = loadImageBitmap(bytes.inputStream())
        } catch (e: Exception) {
            isError = true
        }
    }

    if (bitmap != null) {
        Image(
            bitmap = bitmap!!,
            contentDescription = contentDescription,
            modifier = modifier.background(DarkSurface),
            contentScale = ContentScale.Crop,
        )
    } else if (isError) {
        PlaceholderImage(contentDescription, modifier)
    } else {
        Box(
            modifier = modifier.background(DarkSurface),
            contentAlignment = Alignment.Center
        ) {
            androidx.compose.material3.Text(
                text = "...",
                color = Muted,
            )
        }
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
