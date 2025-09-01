# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep Java 11+ concat logic required by HMS SDK
-keep class java.lang.invoke.StringConcatFactory { *; }
-dontwarn java.lang.invoke.StringConcatFactory

# Keep desugaring classes
-keep class j$.** { *; }
-dontwarn j$.**

# Keep HMS SDK internals to prevent R8 stripping
-keep class live.hms.** { *; }
-dontwarn live.hms.**

-keep class com.reactnativehmssdk.** { *; }
-keep class live.hms.video.** { *; }
-keep class org.webrtc.** { *; }




