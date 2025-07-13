#!/usr/bin/env python3
"""
Slate Dashboard Logging Configuration
=====================================

Centralized logging setup with support for:
- Multiple output formats (console, JSON, legacy)
- Configurable log levels via environment variables
- Emoji-preserved console formatting
- Structured logging for CI/CD integration
- Per-module loggers with context
"""

import logging
import json
import os
import sys
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Optional, Dict, Any


class LogLevel(Enum):
    """Supported log levels"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class LogFormat(Enum):
    """Supported output formats"""
    CONSOLE = "console"    # Human-readable with emojis
    JSON = "json"         # Machine-readable structured
    LEGACY = "legacy"     # Exact print() compatibility


class EmojiConsoleFormatter(logging.Formatter):
    """Custom formatter that preserves emoji formatting for console output"""
    
    def __init__(self):
        # Console format with emojis and colors
        super().__init__(
            fmt='%(asctime)s %(levelname)-8s %(name)s: %(message)s',
            datefmt='%H:%M:%S'
        )
    
    def format(self, record):
        # Add emoji prefix based on log level
        level_emojis = {
            'DEBUG': '🔍',
            'INFO': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'CRITICAL': '🚨'
        }
        
        # Extract emoji from message if present
        message = record.getMessage()
        if hasattr(record, 'emoji') and record.emoji:
            emoji = record.emoji
        else:
            emoji = level_emojis.get(record.levelname, '')
        
        # Create formatted record
        if emoji and not message.startswith(emoji):
            record.msg = f"{emoji} {message}"
        
        return super().format(record)


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'module': record.name,
            'message': record.getMessage(),
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'emoji'):
            log_entry['emoji'] = record.emoji
        if hasattr(record, 'component'):
            log_entry['component'] = record.component
        if hasattr(record, 'operation'):
            log_entry['operation'] = record.operation
        if hasattr(record, 'error'):
            log_entry['error'] = record.error
        if hasattr(record, 'theme'):
            log_entry['theme'] = record.theme
        if hasattr(record, 'widget'):
            log_entry['widget'] = record.widget
        
        return json.dumps(log_entry)


class LegacyFormatter(logging.Formatter):
    """Legacy formatter that mimics print() output exactly"""
    
    def format(self, record):
        # Return just the message, exactly like print()
        return record.getMessage()


class SlateLogger:
    """Enhanced logger with context support"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(f"slate.{name}")
        self._context = {}
    
    def with_context(self, **kwargs) -> 'SlateLogger':
        """Return a new logger instance with additional context"""
        new_logger = SlateLogger(self.logger.name.replace('slate.', ''))
        new_logger._context = {**self._context, **kwargs}
        return new_logger
    
    def _log_with_context(self, level: int, msg: str, *args, **kwargs):
        """Internal method to add context to log records"""
        # Merge context into kwargs
        context = {**self._context, **kwargs}
        
        # Create log record with context
        extra = {k: v for k, v in context.items() if k not in ['msg', 'args']}
        self.logger.log(level, msg, *args, extra=extra)
    
    def debug(self, msg: str, *args, **kwargs):
        self._log_with_context(logging.DEBUG, msg, *args, **kwargs)
    
    def info(self, msg: str, *args, **kwargs):
        self._log_with_context(logging.INFO, msg, *args, **kwargs)
    
    def warning(self, msg: str, *args, **kwargs):
        self._log_with_context(logging.WARNING, msg, *args, **kwargs)
    
    def error(self, msg: str, *args, **kwargs):
        self._log_with_context(logging.ERROR, msg, *args, **kwargs)
    
    def critical(self, msg: str, *args, **kwargs):
        self._log_with_context(logging.CRITICAL, msg, *args, **kwargs)


# Global configuration
_logging_configured = False


def setup_logging(
    level: Optional[str] = None,
    format_type: Optional[str] = None,
    file_output: Optional[str] = None
) -> None:
    """
    Setup centralized logging configuration
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        format_type: Output format (console, json, legacy)
        file_output: Optional file path for log output
    """
    global _logging_configured
    
    if _logging_configured:
        return
    
    # Get configuration from environment or defaults
    level = level or os.getenv('SLATE_LOG_LEVEL', 'INFO')
    format_type = format_type or os.getenv('SLATE_LOG_FORMAT', 'console')
    file_output = file_output or os.getenv('SLATE_LOG_FILE')
    
    # Convert string level to logging constant
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    
    # Clear any existing handlers
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create formatter based on format type
    if format_type.lower() == 'json':
        formatter = JSONFormatter()
    elif format_type.lower() == 'legacy':
        formatter = LegacyFormatter()
    else:  # console (default)
        formatter = EmojiConsoleFormatter()
    
    # Setup console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_handler.setFormatter(formatter)
    
    # Setup file handler if requested
    handlers = [console_handler]
    if file_output:
        file_path = Path(file_output)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(file_path)
        file_handler.setLevel(numeric_level)
        file_handler.setFormatter(JSONFormatter())  # Always use JSON for files
        handlers.append(file_handler)
    
    # Configure root logger
    logging.basicConfig(
        level=numeric_level,
        handlers=handlers,
        force=True
    )
    
    # Suppress noisy third-party loggers
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    
    _logging_configured = True


def get_logger(name: str) -> SlateLogger:
    """
    Get a logger instance for the specified module
    
    Args:
        name: Module name (usually __name__)
    
    Returns:
        SlateLogger instance with context support
    """
    # Ensure logging is configured
    if not _logging_configured:
        setup_logging()
    
    # Clean up module name for better readability
    if name.startswith('slate.'):
        clean_name = name[6:]
    elif name.startswith('src.scripts.'):
        clean_name = name[12:]
    elif name.startswith('src.'):
        clean_name = name[4:]
    else:
        clean_name = name
    
    return SlateLogger(clean_name)


def configure_for_ci_cd() -> None:
    """Configure logging for CI/CD environments"""
    setup_logging(
        level='INFO',
        format_type='console',  # Keep emojis for visual feedback
        file_output=None
    )


def configure_for_development() -> None:
    """Configure logging for development environments"""
    setup_logging(
        level='DEBUG',
        format_type='console',
        file_output='logs/slate-debug.log'
    )


def configure_for_production() -> None:
    """Configure logging for production environments"""
    setup_logging(
        level='INFO', 
        format_type='json',
        file_output='logs/slate.log'
    )


# Convenience functions for backwards compatibility during migration
def print_success(message: str, **context):
    """Temporary helper for migrating success print statements"""
    logger = get_logger('migration')
    logger.info(message, emoji='✅', **context)


def print_error(message: str, **context):
    """Temporary helper for migrating error print statements"""
    logger = get_logger('migration')
    logger.error(message, emoji='❌', **context)


def print_warning(message: str, **context):
    """Temporary helper for migrating warning print statements"""
    logger = get_logger('migration')
    logger.warning(message, emoji='⚠️', **context)


def print_info(message: str, emoji: str = '', **context):
    """Temporary helper for migrating info print statements"""
    logger = get_logger('migration')
    logger.info(message, emoji=emoji, **context)