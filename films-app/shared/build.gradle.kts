plugins {
    kotlin("multiplatform")
    id("org.jetbrains.compose")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("com.android.library")
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }

    jvm("desktop")

    wasmJs {
        browser()
        binaries.executable()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.components.resources)
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
                implementation("io.ktor:ktor-client-core:3.0.2")
                implementation("io.ktor:ktor-client-content-negotiation:3.0.2")
                implementation("io.ktor:ktor-serialization-kotlinx-json:3.0.2")
            }
        }
        val desktopMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-cio:3.0.2")
            }
        }
        val wasmJsMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-js:3.0.2")
            }
        }
        val androidMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-okhttp:3.0.2")
                implementation("io.coil-kt:coil-compose:2.7.0")
            }
        }
    }
}

android {
    namespace = "com.films.shared"
    compileSdk = 35
    defaultConfig {
        minSdk = 24
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
