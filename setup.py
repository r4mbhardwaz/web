#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import os, sys, re, socket
from jarvis import Colors, Config, SetupTools

# get current file path
PATH = os.path.dirname(os.path.abspath(__file__))


def install():
	global PATH

	# check if we have root access
	SetupTools.check_root()

	# ask for default user and installation directory
	ROOT_DIR = SetupTools.get_default_installation_dir("/jarvis")
	USER = SetupTools.get_default_user(os.getlogin())
	WEB_DIR = f"{ROOT_DIR}/web"

	# save web dir in the jarvis config file
	config = Config(USER)
	config.create_if_not_exists()
	config.set_key("web_dir", WEB_DIR)

	# create directories
	if not os.path.isdir(WEB_DIR):
		os.makedirs(WEB_DIR)

	# do installation steps
	SetupTools.do_action("updating system", 	"sudo apt update -y")
	SetupTools.do_action("installing apache", 	"sudo apt install -y apache2")
	SetupTools.do_action("installing php", 		"sudo apt install -y php libapache2-mod-php php-dev php-pear libmosquitto1 libmosquitto-dev")
	SetupTools.do_action("enabling headers", 	"sudo a2enmod headers")
	SetupTools.do_action("enabling rewrite", 	"sudo a2enmod rewrite")
	SetupTools.do_action("restarting apache", 	"sudo systemctl restart apache2")

	# mofify the apache config
	# read the config
	config_content = None
	with open("/etc/apache2/apache2.conf", "r") as f:
		config_content = f.read()
	
	# exit if not readable
	if config_content is None:
		SetupTools.do_action("modifying apache config file", "false")

	# modify configuration
	new_config = replace_last(config_content, "</Directory>", f"</Directory>\n\n<Directory {WEB_DIR}>\n\tOptions Indexes FollowSymLinks\n\tAllowOverride All\n\tRequire all granted\n</Directory>", 1)
	with open("/etc/apache2/apache2.conf", "w") as f:
		f.write(new_config)


	# modify vhosts config
	config_content = None
	with open("/etc/apache2/sites-enabled/000-default.conf", "r") as f:
		config_content = f.read()
	
	# exit if not readable
	if config_content is None:
		SetupTools.do_action("modifying vhosts config file", "false")

	# modify vhosts
	new_config = re.sub('DocumentRoot.+', f'DocumentRoot {WEB_DIR}', config_content, flags=re.M)
	with open("/etc/apache2/sites-enabled/000-default.conf", "w") as f:
		f.write(new_config)

	# apply configuration
	SetupTools.do_action("restarting apache", "sudo systemctl restart apache2")


	# now change ownership of files and dirs
	SetupTools.do_action(f"changing permissions of installation dir ({ROOT_DIR} to user {USER})", f"sudo chown -R {USER}: {ROOT_DIR}")
	SetupTools.do_action(f"moving files to {WEB_DIR}", f"mv -v {PATH}/* {WEB_DIR}")
	SetupTools.do_action(f"moving htaccess file to {WEB_DIR}", f"mv -v {PATH}/.htaccess {WEB_DIR}", exit_on_fail=False, on_fail="done!")	# this throws an error, but works
	SetupTools.do_action(f"clearing up", f"rm -rf {WEB_DIR}/deleteme")
	SetupTools.do_action(f"deleting downloaded folder", f"rm -rf {PATH}")


	# link config file
	try:
		os.link(f"/home/{USER}/.config/jarvis/main.conf", f"{WEB_DIR}/database/jarvis.conf")
		SetupTools.do_action(f"link config file (/home/{USER}/.config/jarvis/main.conf -> {WEB_DIR}/database/jarvis.conf)", "true")
	except Exception as e:
		SetupTools.do_action(f"link config file (/home/{USER}/.config/jarvis/main.conf -> {WEB_DIR}/database/jarvis.conf)", "false")


	print(f"\n\n{Colors.GREEN}Successfully installed the Jarvis Web Application!{Colors.END}")
	print(f"See you at {Colors.BLUE}http://{get_ip()}/{Colors.END}")



def is_root():
	return os.geteuid() == 0

def replace_last(s, old, new, count):
	return (s[::-1].replace(old[::-1], new[::-1], count))[::-1]

def get_ip():
	s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	try:
		# doesn't even have to be reachable
		s.connect(('10.255.255.255', 1))
		IP = s.getsockname()[0]
	except Exception:
		IP = '127.0.0.1'
	finally:
		s.close()
	return IP


install()
