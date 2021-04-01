#
# Copyright (c) 2020 by Philipp Scheer. All Rights Reserved.
#

import os, sys, socket
from jarvis import Colors, Config, SetupTools, Security


# get current file path
PATH = os.path.dirname(os.path.abspath(__file__))


def install():
	global PATH

	# check if we have root access
	SetupTools.check_root()

	# ask for default user and installation directory
	ROOT_DIR = SetupTools.get_default_installation_dir("/jarvis")
	try:
		USER = SetupTools.get_default_user(os.getlogin())
	except Exception: # docker container
		USER = "root"
	WEB_DIR = f"{ROOT_DIR}/web"

	# save web dir in the jarvis config file
	# config = Config()

	# signed = Security.certificate(	keylen=8192,
	# 								emailAddress="jarvis@philippscheer.com",
	# 								commonName="jarvis",
	# 								countryName="AT",
	# 								localityName="Vienna",
	# 								stateOrProvinceName="Vienna",
	# 								organizationName="Jarvis",
	# 								organizationUnitName="assistant",
	# 								serialNumber=0,
	# 								validityStartInSeconds=0,
	# 								validityEndInSeconds=10*365*24*60*60)
	# config.set("certificate", signed["certificate"])
	# config.set("private-key", signed["private-key"])

	# create directories
	if not os.path.isdir(WEB_DIR):
		os.makedirs(WEB_DIR)


	# change ownership of files and dirs
	if "--skip-download" not in sys.argv:
		SetupTools.do_action(f"changing permissions of installation dir ({ROOT_DIR} to user {USER})", f"sudo chown -R {USER}: {ROOT_DIR}")
		SetupTools.do_action(f"moving files to {WEB_DIR}", f"mv -v {PATH}/* {WEB_DIR}")
		SetupTools.do_action(f"moving htaccess file to {WEB_DIR}", f"mv -v {PATH}/.htaccess {WEB_DIR}", exit_on_fail=False, on_fail="done!")	# this throws an error, but works
		SetupTools.do_action(f"clearing up", f"rm -rf {WEB_DIR}/deleteme")
		SetupTools.do_action(f"deleting downloaded folder", f"rm -rf {PATH}")

	print(f"\n\n{Colors.GREEN}Successfully installed the Jarvis Web Application!{Colors.END}")
	print(f"See you at {Colors.BLUE}http://{get_ip()}/{Colors.END}")



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
