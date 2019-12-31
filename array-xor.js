/* I would love to get a pull request with an optimised version */

/* arrayXor([1, 2, 3], [0, 1, 4]) == [0, 2, 3, 4] */

function arrayXor(a1, a2) {
	if (a1.length > 0) {
		var remove = [];
		var add = [];
		var filtered = a2.forEach(function(value, index) {
			if (a1.indexOf(value) == -1) {
				add.push(value);
			} else {
				remove.push(value);
			}
		});

		var keep = a1;
		if (remove.length > 0) {
			keep = a1.filter(function(value, index, arr) {
				return remove.indexOf(value) == -1;
			});
		}

		return keep.concat(add);
	}

	return a2;
}
