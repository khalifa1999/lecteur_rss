const DOMPARSER = new DOMParser().parseFromString.bind(new DOMParser())
fetch('urls.json').then((res) => {
	res.text().then((data) => {
		var frag = document.createDocumentFragment()
		var hasBegun = true
		JSON.parse(data).urls.forEach((u) => {
			try {
				var url = new URL(u)
			}
			catch (e) {
				console.error('URL invalid');
				return
			}
			fetch(url).then((res) => {
				res.text().then((htmlTxt) => {
					try {
						let doc = DOMPARSER(htmlTxt, 'text/html')
						var feedUrl = doc.querySelector('link[type="application/rss+xml"]').href
					} catch (e) {
						console.error('Erreur dans le parsing du site');
						return
					}
					fetch(feedUrl).then((res) => {
						res.text().then((xmlTxt) => {
							try {
								let doc = DOMPARSER(xmlTxt, "text/xml")
								let heading = document.createElement('h1')
								heading.textContent = url.hostname
								frag.appendChild(heading)
								doc.querySelectorAll('item').forEach((item) => {
									let temp = document.importNode(document.querySelector('template').content, true);
									let i = item.querySelector.bind(item)
									let t = temp.querySelector.bind(temp)
									t('h2').textContent = !!i('title') ? i('title').textContent : '-'
									t('a').textContent = t('a').href = !!i('link') ? i('link').textContent : '#'
									t('p').innerHTML = !!i('description') ? i('description').textContent : '-'
									t('h3').textContent = url.hostname
									frag.appendChild(temp)
								})
							} catch (e) {
								console.error('Erreur dans le parsing du flux')
							}
							if (hasBegun) {
								document.querySelector('output').textContent = '';
								hasBegun = false;
							}
							document.querySelector('output').appendChild(frag)
						})
					}).catch(() => console.error('Erreur dans la récupération du flux'))
				})
			}).catch(() => console.error('Erreur dans la récupération du site'))
		})
	})
}).catch(() => console.error('Erreur lors de la récupération des URLs depuis le fichier json'))
