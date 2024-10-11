from . import development, production
import os


__all__ = ['setting']

setting_dict = {
    "development": lambda: development,
    "production": lambda: production
}

current_evn = os.environ.get("APP_ENV") or "development"
setting = setting_dict.get(current_evn)()

del development
del production

print("flask_server_env: %s " % current_evn)
