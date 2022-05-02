npm install -g npm@8.7.0
if ! [[ -d node_modules ]];
then
	echo "installing node_module !"
	npm install
fi
umask 0000
exec npm run start:dev