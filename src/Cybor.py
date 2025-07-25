#!/usr/bin/env python3
"""
Cybor's Virtual Mouse - Main Application Entry Point
Author: Abhishek Tiwary
Version: 2.1.0
Date: July 2025

This is the main entry point for Cybor's Virtual Mouse system.
It initializes both gesture recognition and voice assistant capabilities.
"""

import sys
import os
import threading
import time
from datetime import datetime

# Add the cybor package to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'cybor'))

from cybor.gesture_recognition.cybor_gesture_controller import CyborGestureController
from cybor.voice_assistant.cybor_voice_assistant import CyborVoiceAssistant
from cybor.utils.cybor_logger import CyborLogger
from cybor.utils.cybor_config import CyborConfig

class CyborVirtualMouse:
    """
    Main application class for Cybor's Virtual Mouse system.
    Coordinates between gesture recognition and voice assistant modules.
    """

    def __init__(self):
        """Initialize the Cybor Virtual Mouse system."""
        self.logger = CyborLogger("CyborMain")
        self.config = CyborConfig()
        self.gesture_controller = None
        self.voice_assistant = None
        self.is_running = False

        # System status tracking
        self.start_time = datetime.now()
        self.gesture_active = False
        self.voice_active = False

        self.logger.info("Cybor Virtual Mouse System Initializing...")

    def initialize_system(self):
        """Initialize all system components."""
        try:
            # Initialize gesture recognition system
            self.logger.info("Initializing Cybor Gesture Recognition...")
            self.gesture_controller = CyborGestureController(self.config)

            # Initialize voice assistant
            self.logger.info("Initializing Cybor Voice Assistant...")
            self.voice_assistant = CyborVoiceAssistant(self.config, self.gesture_controller)

            # Set up inter-module communication
            self.voice_assistant.set_gesture_controller(self.gesture_controller)
            self.gesture_controller.set_voice_assistant(self.voice_assistant)

            self.logger.info("Cybor System Initialization Complete!")
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize Cybor system: {e}")
            return False

    def start_system(self):
        """Start the complete Cybor Virtual Mouse system."""
        if not self.initialize_system():
            self.logger.error("System initialization failed. Exiting...")
            return False

        self.is_running = True
        self.logger.info("Starting Cybor Virtual Mouse System...")

        try:
            # Start gesture recognition in a separate thread
            gesture_thread = threading.Thread(
                target=self.run_gesture_recognition, 
                name="CyborGestureThread",
                daemon=True
            )

            # Start voice assistant in a separate thread  
            voice_thread = threading.Thread(
                target=self.run_voice_assistant,
                name="CyborVoiceThread", 
                daemon=True
            )

            # Start both systems
            gesture_thread.start()
            voice_thread.start()

            # Display system status
            self.display_system_info()

            # Main monitoring loop
            self.main_loop()

        except KeyboardInterrupt:
            self.logger.info("Cybor shutdown requested by user")
            self.shutdown_system()
        except Exception as e:
            self.logger.error(f"Critical system error: {e}")
            self.shutdown_system()

    def run_gesture_recognition(self):
        """Run the gesture recognition system."""
        try:
            self.gesture_active = True
            self.logger.info("Cybor Gesture Recognition Active")
            self.gesture_controller.start_recognition()
        except Exception as e:
            self.logger.error(f"Gesture recognition error: {e}")
            self.gesture_active = False

    def run_voice_assistant(self):
        """Run the voice assistant system."""
        try:
            self.voice_active = True
            self.logger.info("Cybor Voice Assistant Active")
            self.voice_assistant.start_listening()
        except Exception as e:
            self.logger.error(f"Voice assistant error: {e}")
            self.voice_active = False

    def main_loop(self):
        """Main system monitoring loop."""
        self.logger.info("Cybor Main Loop Started - System Fully Operational")

        while self.is_running:
            try:
                # Monitor system health
                self.monitor_system_health()

                # Check for system commands
                if not self.gesture_active and not self.voice_active:
                    self.logger.warning("Both systems inactive - initiating restart")
                    self.restart_systems()

                # Sleep for monitoring interval
                time.sleep(self.config.get_monitor_interval())

            except Exception as e:
                self.logger.error(f"Main loop error: {e}")

    def monitor_system_health(self):
        """Monitor the health of all system components."""
        current_time = datetime.now()
        uptime = current_time - self.start_time

        # Log system status every 5 minutes
        if uptime.total_seconds() % 300 < 1:
            self.logger.info(f"Cybor System Status - Uptime: {uptime}, "
                           f"Gesture: {'Active' if self.gesture_active else 'Inactive'}, "
                           f"Voice: {'Active' if self.voice_active else 'Inactive'}")

    def restart_systems(self):
        """Restart inactive system components."""
        try:
            if not self.gesture_active:
                self.logger.info("Restarting Cybor Gesture Recognition...")
                gesture_thread = threading.Thread(
                    target=self.run_gesture_recognition,
                    name="CyborGestureRestart",
                    daemon=True
                )
                gesture_thread.start()

            if not self.voice_active:
                self.logger.info("Restarting Cybor Voice Assistant...")
                voice_thread = threading.Thread(
                    target=self.run_voice_assistant,
                    name="CyborVoiceRestart", 
                    daemon=True
                )
                voice_thread.start()

        except Exception as e:
            self.logger.error(f"System restart failed: {e}")

    def display_system_info(self):
        """Display comprehensive system information."""
        print("\n" + "="*60)
        print("🤖 CYBOR'S VIRTUAL MOUSE SYSTEM v2.1.0")
        print("   Created by Abhishek Tiwary - July 2025")
        print("="*60)
        print("\n📋 SYSTEM STATUS:")
        print(f"   • Start Time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   • Gesture Recognition: {'🟢 ACTIVE' if self.gesture_active else '🔴 INACTIVE'}")
        print(f"   • Voice Assistant: {'🟢 ACTIVE' if self.voice_active else '🔴 INACTIVE'}")
        print(f"   • System Mode: {self.config.get_system_mode()}")

        print("\n🎯 AVAILABLE GESTURES:")
        gestures = [
            "Neutral Gesture - System ready state",
            "Move Cursor - Index finger pointing for cursor control", 
            "Left Click - Index and middle fingers together",
            "Right Click - Index finger and thumb together",
            "Double Click - Quick double-tap motion",
            "Scrolling - Two-finger vertical movement",
            "Drag & Drop - Closed fist with movement",
            "Multi-Selection - All fingers spread wide",
            "Volume Control - Pinch with horizontal movement", 
            "Brightness Control - Pinch with vertical movement"
        ]

        for i, gesture in enumerate(gestures, 1):
            print(f"   {i:2d}. {gesture}")

        print("\n🗣️  VOICE COMMANDS:")
        print("   Wake word: 'Cybor' followed by command")
        print("   Examples:")
        print("   • 'Cybor launch gesture recognition'")
        print("   • 'Cybor search machine learning'") 
        print("   • 'Cybor what time is it'")
        print("   • 'Cybor exit'")

        print("\n⚙️  CONTROLS:")
        print("   • Press Ctrl+C to safely shutdown Cybor")
        print("   • Say 'Cybor exit' for voice shutdown")
        print("   • Use 'Cybor sleep' to pause voice recognition")
        print("="*60)
        print("🚀 Cybor Virtual Mouse System is now READY!")
        print("   Move your hand in front of the camera to begin...")
        print("="*60 + "\n")

    def shutdown_system(self):
        """Safely shutdown the entire Cybor system."""
        self.logger.info("Cybor System Shutdown Initiated...")
        self.is_running = False

        try:
            if self.gesture_controller:
                self.gesture_controller.stop_recognition()
                self.gesture_active = False

            if self.voice_assistant:
                self.voice_assistant.stop_listening()
                self.voice_active = False

            # Calculate uptime
            uptime = datetime.now() - self.start_time
            self.logger.info(f"Cybor System Shutdown Complete - Total Uptime: {uptime}")

            print("\n" + "="*60)
            print("🤖 CYBOR VIRTUAL MOUSE SYSTEM SHUTDOWN")
            print(f"   Total Runtime: {uptime}")
            print("   Thank you for using Cybor's Virtual Mouse!")
            print("   Created by Abhishek Tiwary")
            print("="*60)

        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")


def main():
    """Main entry point for Cybor's Virtual Mouse."""
    print("\n🤖 Initializing Cybor's Virtual Mouse System...")
    print("   Author: Abhishek Tiwary")
    print("   Version: 2.1.0")
    print("   Loading components...\n")

    try:
        # Create and start the Cybor system
        cybor_system = CyborVirtualMouse()
        cybor_system.start_system()

    except Exception as e:
        print(f"❌ Failed to start Cybor system: {e}")
        print("Please check the logs for more details.")
        sys.exit(1)

if __name__ == "__main__":
    main()
