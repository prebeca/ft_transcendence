npm install -g npm@8.7.0

if ! [[ -d node_modules ]];
then
	echo "installing node_module !"
	npm install
fi

# npm install
umask 0000

exec npm run dev

# npm run build
# exec npm run start
