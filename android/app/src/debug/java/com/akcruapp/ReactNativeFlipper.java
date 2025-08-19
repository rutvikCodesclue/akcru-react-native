/**
 * Copyright (c) Meta Platforms, Inc.
 * MIT License
 */
package com.akcruapp;

import android.content.Context;

import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.android.utils.FlipperUtils;
import com.facebook.flipper.core.FlipperClient;
import com.facebook.flipper.plugins.crashreporter.CrashReporterPlugin;
import com.facebook.flipper.plugins.databases.DatabasesFlipperPlugin;
import com.facebook.flipper.plugins.fresco.FrescoFlipperPlugin;
import com.facebook.flipper.plugins.inspector.DescriptorMapping;
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin;
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor;
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;

import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.network.NetworkingModule;

import okhttp3.OkHttpClient;

public final class ReactNativeFlipper {
  private ReactNativeFlipper() {}

  public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    if (!FlipperUtils.shouldEnableFlipper(context)) return;

    final FlipperClient client = AndroidFlipperClient.getInstance(context);

    client.addPlugin(new InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()));
    client.addPlugin(new DatabasesFlipperPlugin(context));
    client.addPlugin(new SharedPreferencesFlipperPlugin(context));
    client.addPlugin(CrashReporterPlugin.getInstance());

    final NetworkFlipperPlugin networkFlipperPlugin = new NetworkFlipperPlugin();
    NetworkingModule.setCustomClientBuilder(new NetworkingModule.CustomClientBuilder() {
      @Override public void apply(OkHttpClient.Builder builder) {
        builder.addNetworkInterceptor(new FlipperOkhttpInterceptor(networkFlipperPlugin));
      }
    });
    client.addPlugin(networkFlipperPlugin);
    client.start();

    // Add Fresco plugin only if Fresco is on the classpath
    final Runnable addFrescoIfPresent = new Runnable() {
      @Override public void run() {
        try {
          Class.forName("com.facebook.drawee.backends.pipeline.info.ImagePerfDataListener");
          client.addPlugin(new FrescoFlipperPlugin());
        } catch (ClassNotFoundException ignore) {
          // Fresco not bundled — skip
        }
      }
    };

    ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
    if (reactContext == null) {
      reactInstanceManager.addReactInstanceEventListener(new ReactInstanceEventListener() {
        @Override public void onReactContextInitialized(ReactContext reactContext) {
          reactInstanceManager.removeReactInstanceEventListener(this);
          reactContext.runOnNativeModulesQueueThread(addFrescoIfPresent);
        }
      });
    } else {
      reactContext.runOnNativeModulesQueueThread(addFrescoIfPresent);
    }
  }
}
