npm install -g npm@8.8.0
if ! [[ -d node_modules ]];
then
	echo "installing node_module !"
	npm install
fi
exec npm run start:dev
