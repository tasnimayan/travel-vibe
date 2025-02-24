
import app from "./app"

require('dotenv').config()

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(
		`=== Server running in ${process.env.NODE_ENV} environment, at port ${port} ===`
	);
});
