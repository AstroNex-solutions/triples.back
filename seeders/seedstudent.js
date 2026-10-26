const { User } = require("../models");

const rawData = `
musaab	mosaabgr@ggmail.com	0799002337	Student	blank.png	\N	<p>&nbsp;</p>	\N	\N	\N	\N	\N	\N	c41cb65e-93d4-43c6-9bc1-5b8123f1077a	\N	2025-09-18 20:22:27.373936+00
mosap mqtishat	mosap.mqtishat@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	abf2f434-c4b9-4be1-afc0-95322ddac943	29	2025-09-19 00:35:25.197346+00
meshal naseer	Meshal.nasser965@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b56874b6-4a3e-4057-a8c5-f13e30baa760	37	2025-09-19 00:41:00.759694+00
hala samer	Hala_samer03@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0b7267a2-ed1d-48df-a46b-c25a31994c7f	59	2025-09-19 01:04:22.237621+00
rahma tayseer	Rahmatayseer@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ef7c574a-3bcf-475c-8585-8c6f59510cb1	70	2025-09-19 01:11:27.215787+00
leith nuseir	leith.nuseir@outlook.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	186b1857-cdfb-4547-bb7d-7aee18a0a410	45	2025-09-19 00:53:02.726587+00
rama amawi	Ramaamawi2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a6bbefff-4e3b-4c3b-b52a-e6608c887a55	76	2025-09-19 01:16:59.892231+00
rana alhuniti	ranaalhuniti2004@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0bbcfd8e-fe81-4a2d-b0b7-0aad6121ab48	73	2025-09-19 01:14:18.246332+00
sara mattar	matarsara16@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4a9371d7-56fb-480d-9b82-614e5be65e3e	67	2025-09-19 01:09:15.68896+00
fajer mishaal	Fajermisheal@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5d919933-b1ba-4556-bc61-c28ef2a63a82	57	2025-09-19 01:03:05.245226+00
rahmah hosam	rahmahhosam046@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	598ab706-769f-4f60-bb78-bdeb9464ea10	41	2025-09-19 00:44:38.369164+00
hazem omaish	hazemomaish44@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	18f69b19-010c-4df8-ad9a-0c40178436ea	55	2025-09-19 01:00:48.760766+00
suha moawieh	Suha_abd@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fe267aba-63d8-46c4-9116-7a44ffa912b1	62	2025-09-19 01:06:14.06929+00
laith joudeh	laith00joudeh@gmail.com	0797811981	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c1465e52-ee2c-43f3-b3cd-c634ba5fa2ce	39	2025-09-19 00:42:34.061777+00
mahmood jbarah	Mahmoodjbarah04@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	98b1c5d2-44a0-4deb-becf-33c9027fe531	32	2025-09-19 00:37:19.740725+00
rand basyouni	basyorand@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fbd033c9-8e45-4070-bd42-32cd8a03d40e	66	2025-09-19 01:08:40.920733+00
rand omar	rand37393@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8442c517-fcee-4fc2-8d79-d4deac9b9247	46	2025-09-19 00:53:51.840065+00
Developer Developer	developer@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c391a9d9-b660-4793-ba82-7ef4dc70adb1	23	2025-09-18 22:09:30.296285+00
bander alotibi	belotaibi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9ba6c758-ac18-4f28-8624-bc912325ac75	60	2025-09-19 01:04:55.654305+00
roeda firas	roedafiras@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5af7054b-fb36-46a8-8d69-9602ec7f6941	77	2025-09-19 01:17:42.105492+00
khalid alshamari	Khalid9609@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c66b9245-07f4-46e9-a5e9-b7a2c381bb70	63	2025-09-19 01:06:45.884158+00
Aseel Aldabbas	aseeldabbas200@gmail.com	\N	Student	blank.png	\N	<p>&nbsp;</p>	\N	\N	\N	\N	\N	\N	5a7e5ea8-7b7a-4d23-b6d5-0eeefbbb6d06	21	2025-09-18 21:33:07.237659+00
dania kharraz	kharrazdania@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4d87b19f-1978-40e5-9b0d-b8d76633f9a2	75	2025-09-19 01:16:25.71719+00
leen abuaqel	mlyf333@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d7ac6dcd-46e2-4b83-af41-79bacfda667a	34	2025-09-19 00:38:38.122353+00
ramiz baqean	ramizbaqean04@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	67aebc21-c553-47d7-940a-8f681a8b2801	38	2025-09-19 00:41:41.882245+00
laith abudayeh	Laithabudayeh420@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	309e7813-67c3-41aa-98d1-61a5279f3001	26	2025-09-19 00:32:40.680267+00
saif majali	Saifmajali32@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ea7034ed-a3ce-47ef-8efc-d119864efc82	78	2025-09-19 01:18:19.905292+00
almuthana khalil	alm0232255@ju.edu.jo		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d7dba755-250f-4f9f-89f6-85be654729f7	47	2025-09-19 00:54:29.686924+00
mahmoud alzywd	mhmwdalzywd398@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	926b22b5-3bde-4c45-9c58-dde0ce79972e	48	2025-09-19 00:55:07.469703+00
triplesacademy	info@triplesacademy.com	\N	Admin	blank.png	\N	<p>&nbsp;</p>	\N	\N	\N	\N	\N	\N	1bad6a3e-3e1a-4140-870f-4201f912ec54	1	2025-09-15 11:41:22.077262+00
mouhsin alajami	m7sen_28@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	78d70d41-21cc-4636-abf1-5d716f13262d	65	2025-09-19 01:08:01.97725+00
yanal altarefe	yanalaltarefe55@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fed8d5c8-c95b-4a5d-970c-af1d43872b9a	79	2025-09-19 01:18:52.070481+00
mohammad abohalima	mohammadabuh44@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a0ee3885-9815-4752-9598-68a0130a7cd6	52	2025-09-19 00:58:14.064953+00
reema alabady	reemalabady2005@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b38171d7-f92c-4e57-a098-c0bf7d713b2e	53	2025-09-19 00:58:56.117744+00
ledaay abd	ledaayman25@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	13f4ed86-113b-4fb3-89e0-c2817a602bd4	33	2025-09-19 00:37:54.776443+00
samer najeeb	Samernajeeb664@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	652f0efb-d67f-4a46-bf02-752b7b134819	28	2025-09-19 00:34:47.388211+00
hussam fraihat	Hussamfraihat21@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	197077c9-be4d-404a-be37-ed0dceae4f74	72	2025-09-19 01:12:54.709699+00
danah alkandari	dndsh04@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	210a058e-5c0b-49f5-8462-452f7168d86a	58	2025-09-19 01:03:41.981911+00
amro migdady	Amromigdady123@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	da4c990a-da7e-4ed4-ab84-5b18fa201875	49	2025-09-19 00:55:50.579492+00
mera qtaishat	qtaishatmera@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f1bbe6c9-47d6-4126-8e7c-ee01a3897ecf	71	2025-09-19 01:12:08.60915+00
hussien alshamari	7seeen77@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	64826d2a-f111-4e64-8a61-e849a85c69e3	61	2025-09-19 01:05:36.998552+00
ayham abusalem	Ayham1abusalem@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	41f92a37-e449-4b27-9e9e-ae6c1f2c51a7	74	2025-09-19 01:14:56.466756+00
mohammad bishara	mohammadbishara011@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0374da88-c93c-4f22-a7a4-54a810508a1e	64	2025-09-19 01:07:24.502411+00
solaf fanek	Solaf.fanek.sf@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1d4ce61a-4687-4abf-892d-efd7d591521b	27	2025-09-19 00:33:51.005554+00
saif nsour	Nsour.saif1000@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dbf3453f-a381-4bcc-9214-d378cd6a6f57	35	2025-09-19 00:39:48.543782+00
bashair houisan	bshbsh379@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	05ab1910-7cfb-4b0f-8654-8e0c4cbe4fd3	54	2025-09-19 00:59:48.161429+00
rania arabiyatt	rania.arabiyatt@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	aefda80c-37a9-4546-953e-f1f830f64583	25	2025-09-19 00:31:55.417733+00
hamad alkandari	hsk_alk@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	aa496545-1f15-469f-af81-42df61c5367f	56	2025-09-19 01:01:25.804034+00
yaser abulaimoun	yaseryaser102004@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	469005e4-4d53-4317-a2c6-dd6553471191	69	2025-09-19 01:10:45.597429+00
faris ayoub	Farisayuob29@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4d1c5563-fb9a-4814-a832-b4ca42caa97b	43	2025-09-19 00:46:05.84432+00
qusai arouri	qarouri@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	52802a59-612b-4ee0-ae44-2b99627403d7	68	2025-09-19 01:10:00.677873+00
renad altahrawi	Renadaltahrawi77@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	473df164-9349-49aa-929f-e7d587f9701a	50	2025-09-19 00:56:36.764747+00
sana ishan	sana.ishan103@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	192f5859-3600-46fd-98ea-5a562c02b658	30	2025-09-19 00:36:08.896372+00
hashem abuirshaid	hashem.abuirshaid7@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8cc64f9e-31eb-4f5a-9770-00182dbdb689	24	2025-09-19 00:30:25.987515+00
jarrah ahmad	J.a.n.sh2003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4ff650e9-632b-4ca5-b4a4-3c9198916b88	51	2025-09-19 00:57:23.874299+00
rawa banihani	rawabanihani26@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ac595eb8-a13f-427d-9b7a-517bd9fa4fbc	42	2025-09-19 00:45:11.606445+00
rose saleh	Rose.saleh0@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	77def569-15a1-491d-923d-8a7170de989b	31	2025-09-19 00:36:48.461659+00
sara firas	sarafiras333@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9caa2d82-3bc9-45bf-b3f6-4e732a194f25	87	2025-09-19 01:26:21.260491+00
shahd bhere	shahdbhere@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	123349d3-31cc-4a0a-80fa-b265c3129b1a	106	2025-09-19 01:39:38.490926+00
jude qtaishat	qteshatjude@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6a498779-c163-4b79-8f53-018d5796c740	83	2025-09-19 01:24:02.440332+00
hamza younes	hamza.aldbsan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e63e0084-716d-4f90-891a-d3be90968705	115	2025-09-19 01:45:24.923606+00
sadan alrowad	sadanalrowad3@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	27c8b444-d0a6-4dee-a237-26f152850475	85	2025-09-19 01:25:11.058827+00
sadel taneneh	22310343@students.hebron.edu	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d6e6e38e-22b6-4392-9967-786907c1612e	99	2025-09-19 01:35:16.430513+00
hiba shaheen	chahin.hiba2003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c77e0e43-e666-4bdd-9443-43a607d36380	140	2025-09-19 02:00:09.077941+00
rahaf mousa	rahafmousa32001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6f4e554b-7a36-476d-98c7-80fd37e187c1	138	2025-09-19 01:59:01.700816+00
Samer chres	Samer.chres@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7eda239c-769c-4aca-a52d-993be7208e1e	125	2025-09-19 01:51:17.977228+00
mahmoud ghouzi	mahmoudghouzi23@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b7538b8f-9513-4c89-8af6-91bb17e273e6	139	2025-09-19 01:59:32.340689+00
kamal ashqar	kamalashqar@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5984b3d9-7056-4859-a399-bfcaa60cb5ad	92	2025-09-19 01:29:24.099791+00
dalia obiedat	obeidatdalia956@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cf9fc6d4-fa31-4201-a143-e316baa670f2	108	2025-09-19 01:40:40.851082+00
dania adileh	daniaadaileh32@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e0eb95be-dfc2-4b6c-8158-94717a733c13	137	2025-09-19 01:58:29.694553+00
renad albanawi	renadalbanawi89@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	aa20c77c-426c-4b65-9905-ddf32b66e018	95	2025-09-19 01:31:12.899628+00
omar alrumai	3mralrumai7@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	47e9cfed-c9c4-403a-9559-10aeb2ae7599	96	2025-09-19 01:31:44.264048+00
ghena almomani	almomanighena9@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	75c2e7f7-ed6d-4a5c-94cc-cca8f4ab8ab1	94	2025-09-19 01:30:37.990684+00
salma alamr	salma.alamr2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	63017365-c150-402c-ab3e-4c44493fb9ce	88	2025-09-19 01:26:59.88386+00
leen tayeh	Leentayeh9@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	65067469-4571-45d0-81a4-b30d45293179	135	2025-09-19 01:57:25.013524+00
dema abutarboush	demaabutarboush@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	29b0acb0-58eb-4a78-814f-24396811c0aa	112	2025-09-19 01:43:02.36489+00
raghad radi	raghad4cool@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	56ee1c34-e4a8-4e47-8d76-d755b87fc0f4	133	2025-09-19 01:56:19.619816+00
etedal alghareeb	e3tedalalghareeb@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ec2cd44c-37c4-4a83-846b-db071b66cbd2	102	2025-09-19 01:37:12.085396+00
deema almistareh	Deemaa6363@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	95a9ace2-4f5a-423e-8b02-b429d0b93325	93	2025-09-19 01:30:02.946863+00
lujain bawaliez	lujain.bawaliez@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	383bb708-8369-4f9c-8b11-67b76883b900	105	2025-09-19 01:39:00.697364+00
karam alqudah	karam99.hani11@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0ccdf9e8-33af-498a-b10a-6c34fa543b59	90	2025-09-19 01:28:16.768282+00
jawad hijazeen	jawadhijazeen2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d5a4c702-52cc-46a8-a1cb-fa350125538b	80	2025-09-19 01:19:34.116257+00
angelina naddour	angelina.joulie.n@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	48fa4c70-32c7-473f-9428-16b5956c1845	132	2025-09-19 01:55:35.097272+00
khaled altaany	Dr_khaled_altaany@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	df5e1cf5-5f49-42d3-9ba2-f0b6bff6eb1e	100	2025-09-19 01:35:57.781286+00
balqes suleiman	slmnblq9@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ef20dbfd-c80c-4d05-a9f9-4b9dfcc78d4b	131	2025-09-19 01:54:58.557004+00
moatazm almatarneh	Moatazma665@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ad753b66-1e9b-41d3-b29e-530a65545fc6	101	2025-09-19 01:36:31.718743+00
anas raeed	anoosraeed@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ff46c806-4d7a-4f0c-b36b-6ae0f6351943	113	2025-09-19 01:43:41.489389+00
hala bydoon	Halabydoon00@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f4273a02-5de5-4477-a0f8-e87d0f0f5416	114	2025-09-19 01:44:24.810164+00
lana sabouni	lana.sabouni1@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5bdaf0e2-2f6d-45bb-ba2e-20bb2f570948	136	2025-09-19 01:57:54.453029+00
loay alburqa	Loayalburqan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6eaf559e-53dd-42a9-abf2-ef797fed6a1c	119	2025-09-19 01:47:50.431434+00
enad zurakat	enadsamerz@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a6549705-df32-404a-91de-b8f1ca56e8cc	129	2025-09-19 01:53:45.683475+00
raneem abuodeh	raneemabuodeh19@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d931bfd3-6666-4fb9-98b9-4d914a1407a2	110	2025-09-19 01:41:55.957152+00
sanaa abuwda	manarsobhy903@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1d6872f2-b810-4a6e-8e8d-da8c8093581d	128	2025-09-19 01:52:57.096247+00
layan abudieh	layanahmad928@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7d5ff011-d2e5-45d7-89d2-56bc45509b6a	103	2025-09-19 01:37:48.194239+00
farah bashar	farahthabet366@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ad367367-f111-46e2-8d90-6f92b1d61feb	121	2025-09-19 01:48:59.391075+00
mena alani	Jismena.2016@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	90a7374a-53e0-49fa-94b2-b9803db4adc8	122	2025-09-19 01:49:27.179063+00
reyam abbas	Reyamfaiz2001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bfb6de87-7aff-4c9a-b94d-b6749fe3091a	123	2025-09-19 01:49:57.813455+00
mustafa fawwaz	Alfawwazmustafa@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1dad9fa3-8478-4dc4-9d51-4b4c999ed0d3	124	2025-09-19 01:50:33.237712+00
yazan azab	Azabyazan7@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9225d30f-e363-4bbc-ac37-edcfd845982d	97	2025-09-19 01:32:56.220571+00
batool werikat	Bat732024@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	55582d76-ebbd-499a-bbad-73436f5cbd4b	116	2025-09-19 01:46:07.822916+00
nadeen ashour	nadeenashour.naa@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e3b54e19-c468-4bf1-8916-fe6373c50b8a	127	2025-09-19 01:52:22.28287+00
kareem almomani	Kareemjounaidi55@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fc2cd40d-2d42-43e6-8c0c-a491b25d15e8	104	2025-09-19 01:38:21.581098+00
khalil smirat	smiratkhalil3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ee590eb2-e6d3-4554-a31b-4a02e286d2f0	98	2025-09-19 01:34:33.944405+00
saeed baidoun	saeedbaidoun0@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a312123d-547d-4429-b65d-5f832843094b	117	2025-09-19 01:46:42.304745+00
faisal rabea	Faisalrabea3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1f30ad09-dad0-4faf-af62-d6d0fed4a064	84	2025-09-19 01:24:34.13149+00
raed alenizy	raedalenizy8@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d4e7f590-358f-47d2-a79b-26c66eeb4b70	109	2025-09-19 01:41:14.33275+00
fahad alajami	Falajmin@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8e56699b-d305-4ef1-be87-861c5fdbc049	89	2025-09-19 01:27:45.341841+00
mohammad alaazeh	www.mohamade222.ma@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	18b22f47-b3af-4fe1-96b4-de84517e6d5b	111	2025-09-19 01:42:27.186299+00
buthaina alsabri	Alsabri.buthaina@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	04f49256-a8e1-4f4c-9a6d-a8fd2ffe4485	91	2025-09-19 01:28:48.907071+00
anas alsarkhi	anasarkhi@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	82d54129-b908-4168-a503-1040ad30f295	82	2025-09-19 01:23:26.110324+00
mohammad alshorafa	mohammadalshorfa20@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	844d08cf-78ac-4c02-95c5-845bdee4e86b	126	2025-09-19 01:51:54.455239+00
sarah nawras	Sarahnawras7@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e9196989-7d0c-4215-a0cf-251774e236d6	81	2025-09-19 01:22:50.900025+00
majd alrowad	majdalrowad2@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c2322ba6-5d83-47d9-90df-cb9f0f637280	86	2025-09-19 01:25:50.220949+00
antonio homsi	Antoniohomsi54@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1ad1906d-e898-4106-aa3c-9924ec9b47c9	141	2025-09-19 02:00:42.725025+00
hamza sqour	hamzasqour094@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	243c9298-2604-46f3-9a63-4f9c65cfe869	130	2025-09-19 01:54:23.341742+00
yumna sassila	sassilay@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	90e94ec2-e7ab-4d39-ba8b-59939e48c718	176	2025-09-19 16:27:20.325382+00
nada mohsen	nadaibraheeem.20@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6beb8146-5b96-459e-b9e6-8292ad56363a	183	2025-09-19 16:32:36.55005+00
yousef herzallah	ymad8228@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4e5a1eb3-200e-4e23-9e80-c378488f77f0	203	2025-09-19 16:58:18.71896+00
raghad bdarneh	Bdarnehr27@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	56ecee3f-1fea-448d-b91f-5ada2a57a3d9	177	2025-09-19 16:28:19.6566+00
bara qaseem	baraqasem2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ff2ad050-e91f-4f8f-88e7-9c6050ef67c6	149	2025-09-19 02:08:02.981521+00
reem mousa	reemazzam30@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b4478ab7-5072-4a57-bf0e-4904ac8f36bd	150	2025-09-19 02:08:40.946776+00
nahla almalwani	nahlamaher2004@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7ede548a-9723-4c72-972d-40cbd5b97038	180	2025-09-19 16:30:19.467977+00
mina ibrahim	Minarafid25@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b09d530c-e971-45f3-873f-b0f00d2aa21e	174	2025-09-19 16:26:08.222044+00
atallah alnatour	wshadow.w23@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b71b3f0a-502e-4a64-b03c-a4db6ed3929b	160	2025-09-19 02:15:34.845178+00
deema mansour	dematerawi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	39fc4e7c-166e-4fee-b18f-d46c151c4d54	155	2025-09-19 02:11:41.465445+00
ann alhor	annxhur@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dc023686-5132-40d4-950c-f37ab6df2241	192	2025-09-19 16:48:20.485708+00
tala saleem	talaola54@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7e4b4ef8-b931-4bfc-aa68-c3a5b1558e2c	158	2025-09-19 02:14:32.383658+00
shahad adel	shahdadel2241@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2523a940-4ae8-4971-ab42-f6df7ee13488	167	2025-09-19 16:16:33.563419+00
mohammed lababidi	mohammed.lababidi04@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f246f0c6-07f9-4c1d-bb4b-a5e9fbfb8336	159	2025-09-19 02:15:05.165928+00
rana zaid	ranazaid2001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3d935264-b328-42ea-ad00-103e89626d96	169	2025-09-19 16:22:23.209923+00
wasan methqal	kuhhss20@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0c6b0a73-b6f6-4702-95e7-46fc6a428049	188	2025-09-19 16:45:15.455031+00
Raghad ghanim	Raghadhanighanim05@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4d87dc77-feee-4790-a054-f02a2acc39d1	175	2025-09-19 16:26:42.949819+00
mohammad almawajdeh	Mghassanmawjdeh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1883c041-df39-4621-908a-2278bf5b0a22	193	2025-09-19 16:49:07.774298+00
munirah al-mutiri	MNAlMutairi0305@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bae70bea-8d43-41f7-b6d6-c8a7abb272e2	165	2025-09-19 16:15:03.521739+00
mohammad samer	Mohammad.malkawi809@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	20fd04e0-672e-47c9-996e-9d6bfdac416d	191	2025-09-19 16:47:32.114667+00
noor ataalla	nour.ataalla11@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5171c42c-1ee6-47ab-9079-24f25038df6c	161	2025-09-19 02:16:11.025125+00
mohammad alkhaldi	Mohammad.kd112233@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9dd734f9-4e79-4a86-854b-b4f0f864b3ae	199	2025-09-19 16:55:36.144363+00
fatima kaako	fatimakaako@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	128c6bea-bc4f-4bed-be41-ea6e9b83a1d7	187	2025-09-19 16:44:16.169999+00
ayat elay	Ytly94400@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	138ac3f8-24e1-4c8d-9819-cece258836ff	201	2025-09-19 16:56:53.820424+00
zahraa siblani	zahraaalsiblani@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	724aa1e6-0b7f-490d-bee2-1e19c731ea13	184	2025-09-19 16:40:20.374584+00
fatma salem	fatmaal3jmi223@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	207d0df6-1923-403c-94f9-e99b6d715b5b	189	2025-09-19 16:46:00.170995+00
ghadeer alajami	ghadoooor24@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8cbc0e9e-1422-4933-99d6-c7eeb66d0db9	157	2025-09-19 02:12:56.027932+00
sondos faisal	Sondosharahsheh22@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2ced0e45-103b-44c5-bd59-385de5f34b39	154	2025-09-19 02:11:07.841677+00
rama alhossban	Ramahussban123@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	59d32a79-a267-44d1-9f5a-55eb25eb5db1	156	2025-09-19 02:12:21.467251+00
layan omar	Omarlayan114@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bcf2e156-1cbf-4084-a766-d5584b493ed7	178	2025-09-19 16:29:03.845098+00
badria yahwieh	Badriawkal@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ffcc0371-8f71-49e3-a2c5-5a3391432dce	179	2025-09-19 16:29:44.167285+00
mariana Chafte	Chaftemariana@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ea908ae9-a20e-437e-89e5-ede2e27f84b5	148	2025-09-19 02:07:21.182305+00
asala dagamseh	asalamohanad2003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	71d31487-00aa-4691-a901-7a8a0177e9bd	182	2025-09-19 16:31:40.555868+00
shaden shawabkh	shadenshawabkh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	63f97723-08ee-4750-92ee-0674a0a0628d	143	2025-09-19 02:02:04.320091+00
fatima atieh	f.mm.atieh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6d0b5745-8e0c-4b6f-a34a-c45373e9f098	173	2025-09-19 16:25:23.990457+00
rajaa awni	ramohammad221@med.just.edu.jo	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6be17682-87cc-4cbb-8db5-d73dcf7dfe87	146	2025-09-19 02:06:17.409162+00
emau baniata	emanmba@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	479a7d99-46ce-433f-9524-ab1d48d3358f	166	2025-09-19 16:15:55.264588+00
leen abuelhasan	leenabuelhasan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	719566bb-8e12-491f-acc4-d8b967294518	145	2025-09-19 02:05:00.900859+00
bayan mansour	Mohammadbayan76@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1dda8c2b-ea30-492c-a9c4-23c3aef1db77	195	2025-09-19 16:51:26.431633+00
rama yousef	Ramahmidan24@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2be0bacb-c3e3-4742-908e-4ac5cbc741a4	172	2025-09-19 16:24:47.666371+00
tasneem altawari	altawaritasneem@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	da7e0abf-8784-4b4c-aaf4-e8983e7e4dcd	171	2025-09-19 16:23:43.654719+00
lana beetar	lanabeetar@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4bd8906a-77a3-4d62-8f6d-e4dd841b48ef	147	2025-09-19 02:06:52.232704+00
amani alharbi	a72144692@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	69be5c45-6e0a-4621-b091-5f0323850a0a	170	2025-09-19 16:23:07.210247+00
tasneem alqabandi	tasneemalqabandi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b83a2bbe-2945-46ab-baa2-fa41518acbe6	194	2025-09-19 16:50:15.244047+00
aseel hanandeh	aseelhanandehm3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6807cac1-a54c-44e4-a170-a02b808bcc76	185	2025-09-19 16:43:09.895413+00
asmaa kanhtan	asmaabu004@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	995aaecb-894b-4199-a173-b51a58e745d9	196	2025-09-19 16:52:28.921705+00
lara ghoury	Laraghoury@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b236abeb-375e-459b-ae4b-d1eb14d52dbc	164	2025-09-19 16:14:23.956443+00
rokia malahifci	Rouqaya.work@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cf17e24e-e819-42c3-8da8-ea483c72e536	197	2025-09-19 16:53:57.231286+00
zainab alshemali	Zanaabii313@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d03da498-cd9a-4736-82ad-6fcd77dc50f0	200	2025-09-19 16:56:15.800559+00
malik baradia	malikbaradia@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2cffbd84-b620-4df0-88de-34df78d72153	151	2025-09-19 02:09:08.869186+00
yusra abohasanein	salahyosra9@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	68e428cc-de06-4baa-bbde-442b13b2c3aa	202	2025-09-19 16:57:35.873491+00
mustafa hazim	mr.mostafa.hasan01@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f2ab9a76-16db-492f-9476-a97627855683	153	2025-09-19 02:10:17.026798+00
ruba alhalabi	rubaalhalabi00@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e5cd0525-e7f0-4b66-9db8-e5a6ab7714c1	204	2025-09-19 17:13:44.840361+00
tala dwek	220062@pou.edu.ps	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	906d6add-ad9e-4e90-bef3-3ef1eaf64e8b	205	2025-09-19 17:38:48.635039+00
radwa seder	rawda14farouq@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d52d422a-0e78-4d42-a895-0e8d1d122bee	206	2025-09-19 17:39:22.314646+00
walaa abuhayya	hayyawalaa99@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4e4c1c7b-6ab0-4567-8ba0-067b510c5123	207	2025-09-19 17:40:06.295029+00
hussien abujumeh	hnlp653@gamil.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5400d063-5eaf-47aa-8989-b9100602e3f8	144	2025-09-19 02:02:38.582392+00
saja shdooh	Sajashdooh200@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	eba932f2-bf41-4be3-a2d5-636e2df41cc1	261	2025-09-22 11:25:35.03832+00
hazar alia	hazaralia24@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e0b23bfe-e0f1-4197-83b0-b2aa8e583457	237	2025-09-19 17:59:23.062131+00
rama albasti	Ramak2836@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ce5d71dc-5241-40c9-8f4d-06586f111934	211	2025-09-19 17:42:23.795181+00
mahmoud khalid	mabuhasna10@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	26f230a9-f716-4a74-8da0-efbc3ed06290	257	2025-09-22 11:16:48.619808+00
malik feras	malikferas110@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bf94b846-6076-4586-8485-b877c36619de	213	2025-09-19 17:43:38.836972+00
zainab alsayes	zainabalsayes4@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d8cf3ae9-3754-40ba-bf4a-e50003b38121	226	2025-09-19 17:51:25.694281+00
rasha khaled	Rasha.khaled2293@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a5801d8d-baad-4785-9bba-9f55f8a97e51	248	2025-09-19 18:05:38.660346+00
omar alqudah	Abkq2016@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	76f2a592-836b-4e5d-a1f2-6913652b7bc1	241	2025-09-19 18:01:28.416146+00
balqees dmour	balqeesmosleh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	12b92ae7-d7e9-411d-bac5-df0a84a6492e	215	2025-09-19 17:44:43.915639+00
entisar alraish	Emalraish@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	49405cdf-fabc-4eb9-bde5-07d64f6220bd	221	2025-09-19 17:48:03.852938+00
zaid mesmar	Zaidmesmar11@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	21235c82-2920-4c38-b4be-4a9e918655e3	222	2025-09-19 17:48:42.719183+00
fares alseidi	faresf2000@outlook.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d8601d8c-823a-4ded-b9cd-bcce72f66a65	223	2025-09-19 17:49:19.862988+00
buthaina abuawad	buthainaabuawad14@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	93e0aed5-fe18-45ae-be82-9137f16d7cb9	224	2025-09-19 17:50:06.926939+00
suhaib abuqdery	Suhaibabuqdery@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dc5e1253-f671-4d8f-85a6-ec7fbca3a665	225	2025-09-19 17:50:50.06978+00
jawahir ayed	jawahirayed@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0e864172-5da0-416b-9f7b-e7dba4d2a0e9	244	2025-09-19 18:03:07.351494+00
zein yahya	2002zeinyahya@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	90fb3b40-d4b8-442b-a189-bf262cef0df3	236	2025-09-19 17:58:51.182578+00
weam sowan	weam.sowan@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4445df7b-824f-48f5-9a29-87d913996b34	250	2025-09-19 18:06:28.285775+00
mohammad assal	A.0538385411@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4cd3bcaf-b6f4-4789-ba4b-a55140894e03	210	2025-09-19 17:41:54.462516+00
moatassm habashneh	moatassm.othman@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0afd4a7c-c999-4130-87b4-6f5b111e5370	230	2025-09-19 17:54:50.28469+00
rashed alsayyedalalqamawi	rashedalsayyed66@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4b980f80-3ef6-4059-bfb6-3b31420d482e	231	2025-09-19 17:55:37.712907+00
khaled alotaibi	kalotabi7@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	17e48848-1a76-4198-bcc5-f2c0932c2c4f	232	2025-09-19 17:56:22.120195+00
ebaa alsarayreh	ebaaattallah170@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bea7103e-d6f8-4171-966d-583bfeb6e4a1	247	2025-09-19 18:05:00.785183+00
mohammad shakally	Shakally98@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a18efe03-9ef9-4262-b941-03916dd13bc9	228	2025-09-19 17:53:09.403879+00
sabeen qadri	sabeenaqd052@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	97efdb18-53fe-4e9b-b786-b167481b3d73	235	2025-09-19 17:58:21.596769+00
dana bassam	Danaalnashash@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e28598c5-601c-4a7d-b48c-69111d9bda42	245	2025-09-19 18:03:44.159819+00
sara dmour	mdsara902@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	626f6159-2943-4c72-9caf-d18baaaf8fd7	216	2025-09-19 17:45:20.448728+00
osama alatrash	Osama-aka@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	798e5e24-a1e0-4481-b3fd-2f3d16d9e594	239	2025-09-19 18:00:24.94648+00
safa zoubi	Safazoubi98@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3509494a-aac5-4ff5-9257-98b7318577c7	240	2025-09-19 18:00:58.17597+00
julia shiyab	juliashiyab@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fe6d16a0-49c6-4237-9a71-b72ca0c4cd91	252	2025-09-19 18:07:31.277702+00
zeena dabbas	Dabbaszeena@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d149ea3b-fe43-40c5-af1d-687072a0d9f1	242	2025-09-19 18:01:55.084616+00
khairiah ahmad	khairiahahmedalhelali@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f98de012-441c-4997-81ff-02d2e0571f41	209	2025-09-19 17:41:22.347819+00
tony mazzawi	tonymazzawi2019@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4dbeae57-d9fe-4e68-a672-cd28cd9995e9	256	2025-09-20 07:02:13.491322+00
mohammad kloub	Mohammadkloub888@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fb63d54d-1beb-40e3-a36b-c66844fe4ea7	243	2025-09-19 18:02:30.465512+00
zahraa chahla	zahraachahla3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4a72d264-7a9e-40eb-b469-20abeb275185	246	2025-09-19 18:04:12.919173+00
mohammad almalkawi	mohammad.a.s.a.malkawi@ciu.edu.ge	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	33418f60-fb0f-4cf9-bd03-3783b96a8cf1	267	2025-09-22 11:35:21.083477+00
wesam shreim	wesam.shreem05@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4bd736b5-973b-4c74-a0ad-cd4eaf2790ca	258	2025-09-22 11:20:49.661292+00
rashad elshare	rashod7709@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5d16ba61-847b-4e63-8f4d-e4a0e9ff2bbe	233	2025-09-19 17:57:04.472679+00
laith alnuiamat	Laithnuaimat42@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	91515078-f527-4689-8b66-07babd870c06	227	2025-09-19 17:52:06.589264+00
khaled abushelbaya	Mkskhalidm@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6713409a-1d67-49f4-b327-a154f679bffd	254	2025-09-19 18:08:34.054267+00
joud tarawneh	Joudtarawneh99@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6d5663ef-24f7-4f30-879e-98903d03a553	260	2025-09-22 11:23:31.446696+00
mays muamar	muamar.mays@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6e67675f-1445-42e1-935f-b24a4cf16d16	253	2025-09-19 18:08:03.022351+00
majed aref	majedaref2020@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a49d0093-ffa0-4a56-a2ef-f1a37e1ec799	217	2025-09-19 17:46:02.359845+00
beshayer alanzi	bashayer8790@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	71943011-64ec-4dc7-a2f7-eb72f4c113cd	264	2025-09-22 11:29:07.082218+00
sarah arabiyat	Sarah.arabiyat2003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	420b611d-39be-4853-99c5-cb79c4cb3d00	229	2025-09-19 17:54:17.704229+00
shahd awaja	shahdawaja2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	607c0e72-8b2f-4328-8385-1547942efe40	212	2025-09-19 17:43:03.780668+00
farah aljaafreh	Aljaafrehfarah35@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1ab27844-7017-4bbb-8435-39c55859a3bf	262	2025-09-22 11:26:39.020175+00
omar ragheb	omarmohammad2434@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	af27a3d9-98fe-4a5e-b600-37b369ecc2fb	219	2025-09-19 17:47:19.950558+00
dana hussein	danahussein126@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	190ba40d-05ca-4fe5-86fe-22d62e6a364a	271	2025-09-22 11:39:20.184608+00
hala jaberi	Halatjaberi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a5e28165-9e7b-4552-8f16-b6ddabe4758b	263	2025-09-22 11:28:20.791046+00
amer alajmi	Amersalajmi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	00dae74a-d37a-4534-a3d6-afcd1faf9b49	268	2025-09-22 11:36:07.80026+00
sara jarrah	Jarrahsaja773@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	855435fb-d9f9-4289-af9c-92e33b07c387	218	2025-09-19 17:46:32.945487+00
khaled alqhtani	khaled28287@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b461715e-d5ec-4205-8ac6-c42683a2d90c	272	2025-09-22 11:40:08.812563+00
mohammed alsuwailem	m.alsuwailem111@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	24fba2f3-c56b-422a-8a94-640ecc42d90a	273	2025-09-22 11:41:47.331531+00
malak kabha	Kabhamalak13@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	58b86183-e38e-4f80-9a7a-a7097a8c771a	274	2025-09-22 11:42:39.991712+00
rahaf hmedat	rwael244@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6b18f8db-8599-4c10-b568-c890952efb5e	275	2025-09-22 11:46:45.428571+00
faisal alotaibi	vvvip496@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cd23c9c3-8a66-4305-8e47-49440a307c93	277	2025-09-22 11:52:44.131934+00
mariam almahameed	Mariam0almahameed@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b1e7e08b-5b04-4746-bf1f-720d54ff5831	310	2025-09-23 04:28:00.807878+00
carmen thaer	carmenthaer2002@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9d6f2a44-314b-4775-85fa-e392e81d2b91	301	2025-09-23 04:18:07.392082+00
mohammad aldihani	mhahk321@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	89be614e-90b1-4b4e-944c-a62f790bc150	295	2025-09-23 04:14:37.531896+00
raghad alenezi	Rghd05731@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	09d6f0c1-402a-481e-84c4-8f653b7c7fe4	214	2025-09-19 17:44:08.944951+00
waleed alazmi	Waleed990998@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	601da4b3-c831-4283-903e-48f2f8f5b413	279	2025-09-23 04:01:32.581817+00
rayah rawashdeh	rayah.rawashdeh01@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f1316920-975d-40b3-bb7b-6b290ce69b4f	311	2025-09-23 04:28:32.506151+00
jamal alkandari	Jamal.a.jalkandary04@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bb1a1b98-bde7-4bbc-8961-0328d48f89ce	280	2025-09-23 04:02:12.450911+00
yanal baqqen	yanal.baqqen.k@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	767fac0c-18b1-45ef-ad32-6157af22c46a	318	2025-09-23 04:33:46.198264+00
khaled alsalem	Khaledalsalemq8@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	aefb78cf-fc6d-4530-8063-a11d8d4a4684	283	2025-09-23 04:04:25.258752+00
noor gerbawi	noorgherbawi515@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bae881ab-076e-4737-947d-fec2dcd0a3da	289	2025-09-23 04:10:19.505854+00
zeinab alnatsheh	zeynabnatsheh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9d1345be-79d7-4c1d-b2ba-6a7e032748ca	285	2025-09-23 04:07:39.381956+00
sara rahamneh	saraabadi2004@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	33952aa1-2f1d-4fdb-8f22-8d48c5cf3bfe	286	2025-09-23 04:08:14.86181+00
sadeem matalka	samatalqah21@med.just.edu.jo	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a2e1e64f-85ca-400c-818d-b69e4b63a29c	287	2025-09-23 04:08:48.153297+00
maya swaiss	mayaswaiss03@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	45a44e9a-d83f-4b75-b3d2-e021ed98e5ed	288	2025-09-23 04:09:37.46942+00
diana hussein	dhussein824@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	55ab8dc5-9ea6-4c0c-a764-2098aa363596	320	2025-09-23 04:35:14.662626+00
sondos zyad	Sondosziyad78@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dd9edf94-389d-480b-ae82-1c7d95fa0674	312	2025-09-23 04:29:09.762521+00
khaled alshamari	ikhaled.v90@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f4fa3685-acd9-4b0f-861e-8c0969462fa3	329	2025-09-30 15:57:13.703803+00
mai ibdah	Maiibdah@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	300acf04-778b-4ef0-82bd-fa277299c890	309	2025-09-23 04:27:35.670106+00
khaled alenezi	Mikreal25@outlook.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bdc293b9-fae0-47be-b628-c47659abd050	322	2025-09-23 04:42:24.925631+00
mohammad magableh	magablehtitanium@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a93449fa-0db5-460b-b943-540c0dbb954b	120	2025-09-19 01:48:25.169941+00
saba zayadeen	Sabazayadeen00@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4294eda5-03e1-46da-a67a-f26038a30293	317	2025-09-23 04:33:16.243212+00
jawad zarura	zarurajawad@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4f1f3732-a9a9-4c96-83a0-97e6a02653e1	276	2025-09-22 11:47:41.025183+00
jawad halosh	Jawad.444@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1a5735f2-129a-48e8-aee8-a7ff014a3d49	293	2025-09-23 04:12:40.318361+00
badie abuzaid	badeaa466@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	33804324-4785-4b95-a946-26da6c2070f5	299	2025-09-23 04:17:04.609655+00
siham daas	Sehammulham@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	34c0f650-4690-4cd2-adeb-bd548a247633	306	2025-09-23 04:21:42.806438+00
aseel almutairi	aseelmajedal@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6bef4cf2-bc42-4b12-9624-1b51f3759f7a	303	2025-09-23 04:19:05.73973+00
jomana ashkanani	jomanaashkanani@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	76b151b3-7043-4079-a8ad-815d4bed7cd6	316	2025-09-23 04:32:39.312313+00
sewar shennar	sewarshennar@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f6901ec8-62cc-4769-b9eb-70dcf9cde806	313	2025-09-23 04:29:50.860668+00
manar essam	manar.essam2012@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	52091903-646a-47d6-9af4-f5b00b0024b1	308	2025-09-23 04:27:08.341639+00
laith bader	Laithbader000@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ea75b819-2e1b-4934-a405-840c0eac2f61	327	2025-09-23 15:22:43.657095+00
rawan abualannaz	Abualannazrawan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	20f8dc22-72c5-4957-9e3d-04b8ee97e6eb	282	2025-09-23 04:03:41.362685+00
ramzi alnassraween	Ramzifn00@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2f6772b3-9f87-4343-ae82-4882c86b6b70	291	2025-09-23 04:11:29.569762+00
yasmina mansour	Yasminakmansour@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	85d0b9d8-23ca-48d0-bebc-db97953fe10a	307	2025-09-23 04:23:44.575132+00
hussen aljoher	goldplaysmc99@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0a3e071f-6b9f-453c-9cd2-4ceab092360e	300	2025-09-23 04:17:36.562643+00
hawra alkhabbaz	Hawrayalkhabbaz@outlook.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d0927c33-ed9a-491d-a2f1-179ad1acafc8	314	2025-09-23 04:30:39.493489+00
mohammad aldweeri	mohammad.aldweeri@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	406f8354-d8f8-4579-a618-177449d90365	315	2025-09-23 04:32:05.261105+00
wajd tareq	Wajdtareq11@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	15081168-2458-42d5-b0fb-9dad1710267e	328	2025-09-29 15:34:46.157445+00
hashim bataineh	hashimbat4@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	abef9de8-1af6-43f0-9417-1d97e2defcab	297	2025-09-23 04:15:49.21398+00
Asem Hamarneh	Asemhamarneh003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	39e2f21c-d833-4965-99b9-9a21b7c5f1fe	330	2025-09-30 17:27:25.605321+00
bahaa almomani	bahaa.283@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a14946a8-5ed7-45f0-82d0-056d0bb1183c	298	2025-09-23 04:16:27.925642+00
mohannad rababa	Mohanned.rab@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	992b837b-91fd-4904-95de-7bebf29748a9	304	2025-09-23 04:19:39.115974+00
mohammad alajami	Mohammed9kww@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b1c46486-9b31-48d7-af81-30d3ee44815a	325	2025-09-23 04:44:04.237947+00
tasnim mountaj	tmountaj@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fb5b91ad-ef9e-434b-98d5-36f6ba99e14c	278	2025-09-22 11:54:28.490358+00
sara majdi	saramajdi2002@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	555d7871-f886-4673-ac23-35634f039e7f	305	2025-09-23 04:21:14.459335+00
razan aldibi	razanaldibi2005@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2c4091b9-aaae-4af6-941b-875b24f53148	302	2025-09-23 04:18:38.33534+00
matta zabaneh	mattazabaneh2403@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	454076e7-7e5d-4696-add6-5fc555c55b38	290	2025-09-23 04:10:57.810644+00
mohammad almistrahey	Al28024236@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cd9754f2-35ff-43e8-b333-d521840af292	319	2025-09-23 04:34:15.753827+00
yala alhroub	yalaalhroub1993@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	da3f1a28-620b-4544-b653-559641b1e08d	326	2025-09-23 04:44:34.942153+00
kinda alkisswani	kindakisswani@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	42023820-b0d7-4adc-b36b-55e0aa1914fb	331	2025-09-30 17:42:00.475619+00
lujain amawi	lujainamawi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c5de5735-2116-46c0-975f-6902fc2c7e23	383	2025-10-12 22:59:44.185937+00
rand alfaouri	Randalfaouri02@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c63eed57-c635-4e20-a1e7-0e656c27b23b	372	2025-10-12 22:42:03.706361+00
sara absi	sara.absi21@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5083642b-a362-49b2-83d1-988a491ac497	371	2025-10-12 22:41:34.814781+00
menna zaqout	Menna_zaqout@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c2dba19c-d301-485d-9590-51736217e30a	355	2025-10-12 21:13:18.947518+00
tariq abuawwad	tariqawwad.8s@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b69f7431-73b6-4937-ab39-667988481a70	356	2025-10-12 21:13:56.098714+00
jude habaybeh	Jude.habaybeh204@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	45b448ea-2f27-4956-a95a-0f28f7d43105	345	2025-10-12 21:04:04.807326+00
lina sawalha	Lina.sawalha@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	503945c4-6304-4ba9-ac01-d8ac0b1f1b9f	381	2025-10-12 22:56:07.040981+00
noor alfaraj	noor.alfaraj3030@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	490933da-0621-4e33-9e6a-a85ff7a6dd7f	382	2025-10-12 22:57:38.698931+00
hajer alateeqi	H2alateeqi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3f0f05e9-89fa-46d4-96fe-2bb6154fa816	378	2025-10-12 22:53:24.19816+00
heba alkhatib	drhebaalkhatib92@yahoo.com	+962785754399	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f06678e5-0e17-423e-9df4-5a3e7dfb5e0b	337	2025-10-08 17:29:52.034338+00
raghad abhari	abhariraghad@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	36caab30-16e4-4edb-b795-c45ac712b070	336	2025-10-07 16:36:11.914378+00
shahd amer	Amershahd01@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d5436d42-682b-4861-89e3-e6b2b549e51f	351	2025-10-12 21:10:46.27289+00
waad almanaseer	Almanaseerwaad@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9e18b51d-8673-4569-a9e8-f7c5764767d8	353	2025-10-12 21:11:58.787326+00
noor kamal	noorsabaneh1112@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9ed4fda9-2c90-42f2-972b-db6ec58538b9	349	2025-10-12 21:09:31.409363+00
osama alqannas	Osama.alqannas10@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	01f531b8-78e2-4e7c-bf4f-eb02b7b8a1ab	347	2025-10-12 21:06:49.353119+00
ayah zaher	ayahzaher2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	74cdba30-a937-44ac-aef5-5fabd905b05a	375	2025-10-12 22:49:07.214046+00
rawand taha	Rawandt99@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c7c164a3-210f-455c-be7f-f8444c8b8b4b	373	2025-10-12 22:42:43.472829+00
Mohammad alanezi	M7amd04@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a3a246ef-5ece-4196-9cf1-72a27240df1a	344	2025-10-12 21:01:37.457966+00
razan omoush	razanomou92@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5e2a9b40-9963-4f5f-b43c-f38681004584	363	2025-10-12 22:28:55.091108+00
Raghad Alshareef	Raghadalshareef238@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	05c55900-7fe8-446f-973a-8beea0422fd6	359	2025-10-12 22:22:02.814615+00
balsam mahmoud	balsam189fb@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	57a51370-0e56-4e32-b742-1b17855355cc	334	2025-10-07 15:09:03.580115+00
hamzah almusleh	hamzah0408@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	81ae62aa-0454-4a43-9da0-f2d8379c71bf	366	2025-10-12 22:38:56.741421+00
hasan kahhaleh	kahhaleh.hasan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c32b84c6-006f-4bbd-92e9-e3cee70277f0	364	2025-10-12 22:37:35.554828+00
massa raed	Massaraed1309@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7f632759-8dc8-423e-a741-2aba97fdb931	385	2025-10-12 23:03:36.993531+00
lana eghbaria	lana.eghbaria@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	50f1808e-bba2-4853-bf01-2ed49de69265	374	2025-10-12 22:43:10.957381+00
nout shareef	noutshareef@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fa7a4535-be75-4785-88cc-15fdae5090cf	386	2025-10-12 23:04:07.055585+00
hamzeh dajani	hamzehdajani@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	376602fc-5c4f-49a0-8fa8-75c8a4834d1e	340	2025-10-12 20:56:25.368611+00
yazan asali	Yazanasali512@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	958d08c8-c8aa-466b-a290-c1eabed483bd	365	2025-10-12 22:38:09.846968+00
hashem abotarboush	Hashemabotarboush@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7965f497-c587-4912-8bc9-9e38c03a76cd	370	2025-10-12 22:41:04.613783+00
wseem allawama	Waseemallawama9@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c13849e0-36db-4f55-8161-1e015628de69	367	2025-10-12 22:39:28.352675+00
zubeida radwan	zubeidaradwan2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c242815d-15d3-440e-a699-d1ba8a1f48bd	368	2025-10-12 22:39:58.042488+00
issam mokhadder	Issammkhdr@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	acbd2f1f-5b4a-4283-ac88-9ddc507daad8	360	2025-10-12 22:23:47.307326+00
beesan labeeb	labeebbeesan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	403479eb-32bf-48ca-900d-24a852291535	348	2025-10-12 21:07:19.549395+00
heba almahariq	Hebaalmahariq@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	25c10f30-949f-48b8-a71c-21c390cfda04	354	2025-10-12 21:12:36.341957+00
rawan abdalsalam	rawanabdalsalam14@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	46265c8c-e26d-44f2-8190-1e86d5f60ac6	346	2025-10-12 21:04:48.782919+00
raneem yabroudi	raneem.yabroudi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b617783d-b062-4f88-a164-13db7afd7551	342	2025-10-12 20:59:05.174463+00
sarah fraij	sarahfraij2@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c2c51d35-7e9b-4105-90ba-12c11799e319	339	2025-10-12 19:06:22.444984+00
zaid feras	Zaidferas03@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fdd0fa94-68f9-4499-8152-d3bcf0fac3b6	376	2025-10-12 22:49:39.827427+00
lujain badareen	lujain.badareen99@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a82f4830-52ff-4ea9-b960-6e2566b8c3b6	362	2025-10-12 22:25:27.512085+00
sondos mazen	Sondosmazen2001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	36c69e02-77ec-4c30-984b-9c664884856c	350	2025-10-12 21:10:18.200599+00
shahed alshomali	shahedalshomali3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0cfa61df-465c-4668-bedb-9deb78d1a9ea	379	2025-10-12 22:54:26.701871+00
natal alabbasi	natalabbasi13@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f3bcc712-7cb9-4f4c-87f0-c5d7eaee0a08	380	2025-10-12 22:55:00.031916+00
hadeel tanbouz	Hadeel.david.tanbouz@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	99665684-648b-43cf-b6de-180620fedac4	358	2025-10-12 22:21:29.068236+00
saeed awad	Saeedawad368@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f064c620-8fd9-4287-bc9c-4416151cd637	384	2025-10-12 23:01:09.060545+00
maram haymor	Maramhaymor@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b24a1f42-793d-43ee-b826-3340dbaedb15	343	2025-10-12 21:01:04.063696+00
dana alsharif	alsharif.m.dana@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f84bb28e-f766-4856-941f-65d33d6f8c42	357	2025-10-12 21:14:40.682232+00
lyn hirzallah	Lynhirzallah@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	81692a71-35fd-48cd-a518-fe775525f09b	387	2025-10-12 23:04:41.105586+00
mahmoud baloot	Mahmoud.baloot1@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5f914fc5-5ab4-48fb-87a2-c4217126b727	388	2025-10-12 23:05:10.027511+00
ibrahim almallah	Ibrahim.almallah123@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7dd7737b-cb56-4b5d-82f1-b5dcc11c283a	389	2025-10-12 23:06:04.825769+00
shams younes	shams1212003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	372667f9-4887-43f5-b43c-fbfeee5935c3	390	2025-10-12 23:06:35.431482+00
mohammad alnsser	mo.anas2003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d42b21a5-facf-4631-a1b0-0e629ed30dd8	338	2025-10-12 13:43:14.751337+00
fares alskhary	alskharyfares@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	59d835fd-5bdc-4c90-ba96-a56745307c65	392	2025-10-12 23:07:43.958937+00
rama alkhateeb	alkhateebr88@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e37fb7d3-519f-4fea-8d2d-01d0d866ada7	393	2025-10-12 23:08:16.054506+00
lelian baqaeen	lelianbaqaeen@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3499fef4-81eb-422f-a6c1-67ec7580f845	394	2025-10-12 23:09:09.184175+00
shukri alomari	shukrialomari00@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2bc93e62-5892-4326-852b-5ff6e3541e2b	419	2025-10-13 00:09:52.151256+00
dina haddad	dina20268@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d3bf6c36-0a8d-41f7-85cc-434b31d0b973	433	2025-10-13 00:47:12.975592+00
nagham ali	nagamali2002@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	03abed0d-75c5-4ab7-aa9e-56134ec88e81	431	2025-10-13 00:43:50.620563+00
zena faisal	Zenasukkar@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c9433fbe-67c1-4a51-b1df-9893afaaa89b	401	2025-10-12 23:16:29.513988+00
obada osama	Obadaosama72@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b0c0bcae-0979-4000-b4ee-b7610e8884f1	420	2025-10-13 00:10:43.336763+00
khaled taha	Kh.n.taha8@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	56e21675-bb88-45ec-8c53-ede20ed5bcd2	399	2025-10-12 23:13:55.579911+00
gabriella moussa	gabriellamoussa1@outlook.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	907bec68-113f-4e2d-9d8c-4fa055e6cebb	404	2025-10-12 23:42:38.608538+00
omran fawaz	omranfawaz4@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1e895390-250e-4282-b12c-f17fdb6e0989	403	2025-10-12 23:41:43.991976+00
roia ahmad	roiaahmadmed@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8e3228b2-f3b0-422a-9aca-d4d46e85caac	434	2025-10-13 00:47:42.928414+00
mohammad tarifi	tarifi2003@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a64db9b8-7c43-4f2b-9d04-16e77563786a	426	2025-10-13 00:38:00.870728+00
batool abbadi	batoolabbadi98@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	908206ac-28f3-44f6-b416-53625b94fc38	408	2025-10-12 23:50:34.574959+00
mayar ibrahem	mayaribrahem106@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8cea87b7-4e11-40f2-8ba1-9a438368740a	409	2025-10-12 23:51:28.562719+00
suaad ahmad	Suadbaha@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9e3ceaff-eac4-43c0-a663-994bebace51a	410	2025-10-12 23:53:15.257141+00
halima ahmad	Halima9392@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9666e563-234b-4764-bcd9-c5f365caa120	411	2025-10-12 23:53:51.179818+00
murtada adaileh	adailehmurtada@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6de13d3f-7742-4569-adfc-a3d92451b072	412	2025-10-12 23:54:45.794904+00
rayan shtewe	Shtewerayan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b044b2ef-3c2d-4b0c-928c-36659458b5f5	413	2025-10-12 23:56:27.746527+00
tuqa mohammad	drtuqa2002@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1e89b6d5-e5cd-409f-827c-df15be366726	414	2025-10-13 00:06:10.372568+00
mazen hindi	hindimazen@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	81f5c5a8-1bcb-4589-8c26-8d6f07534de0	415	2025-10-13 00:07:06.056796+00
mohammad majdoubeh	Majdoubehm444@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	45bfe001-1eae-4354-93c9-455f9a80b7bd	416	2025-10-13 00:07:47.217205+00
mahmoud radoan	mah.rad.ps@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8e6a5c95-8530-4c69-8e68-bed65febd035	417	2025-10-13 00:08:18.92178+00
rashed aburashed	abo0909louy@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	54650172-03c8-46e0-9041-e01609eb6194	418	2025-10-13 00:09:04.182496+00
omar jallad	Oammar77777@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9b686889-145a-4a14-8f7a-0a4881728ab8	396	2025-10-12 23:11:56.752793+00
maisam abufraih	maisam94frih@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c5dca924-fe51-4695-90bd-d10a496069d5	441	2025-10-13 01:04:58.875256+00
shahed saraiereh	shahedsaraiereh14@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bca9eaf4-f391-4c8c-8ea9-f1ac06aaef4f	421	2025-10-13 00:12:00.149264+00
yaqeen mahajna	ybmahajna22@med.just.edu.jo	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ad12243f-c090-4270-afa7-160c111c6ab7	422	2025-10-13 00:12:32.961783+00
bashar dabien	bashardabaien1@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	34a62fb7-4a69-4aea-820d-76895619a4aa	395	2025-10-12 23:10:04.665477+00
zaid telfah	ztelfah3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	64dbe42d-2606-4565-ae04-4c2bb4b308c7	447	2025-10-13 01:22:28.415993+00
rand alshayeb	Randalshayeb1997@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cc569023-3b64-4b4c-a772-81e8c8cd817f	425	2025-10-13 00:36:39.86562+00
maha alaanzi	uoiu22991@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	908d1785-0ef3-4894-b7e3-037fc722f83b	449	2025-10-13 01:27:24.005706+00
zaid momani	zaidalmomani5@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a637f127-7962-40c7-b97c-4a7f1a2d6cea	427	2025-10-13 00:38:36.572925+00
yazeed haddadin	yazeed.haddadin@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	322bf448-74cd-4d59-a95d-60d8e9818965	428	2025-10-13 00:40:46.233526+00
maha harahsheh	totomaha997@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f8b6a1bb-4325-4462-b7eb-c0132a6da611	429	2025-10-13 00:41:56.957689+00
sdra abdulbaki	sdra1abdulbaki@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	29dece28-cc8c-4b8c-8bef-b0c8c0352c62	406	2025-10-12 23:44:06.587238+00
mohammad khalili	Mhmd.kh998@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	600368ca-0636-48b8-800a-0c3d148bfa53	398	2025-10-12 23:13:23.47734+00
salam nabeel	alheehsalam80@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	083048a6-5f0b-4e29-98ca-bd467e8c2212	432	2025-10-13 00:44:24.400238+00
leen alshamasneh	leenshamasneh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	93c37254-7bae-457d-8f5b-339af4a1ca68	430	2025-10-13 00:42:50.145536+00
angela farah	angelafarah30@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7a28aa68-4b2f-4b85-84a0-a451fde07fcd	405	2025-10-12 23:43:30.508041+00
nour hasan	nourhasan691@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	05e9fb16-d491-493a-ab61-ba53a2d4bce0	435	2025-10-13 00:53:18.641556+00
nimer alkhateeb	nimer_alkhatib@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d1b8ba40-3eef-438e-a3e1-1964df913207	436	2025-10-13 00:57:39.698342+00
haifaa alsafadi	haiiifasafadii@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fbc2c9c0-7754-4b09-8161-658725172eed	437	2025-10-13 00:58:10.949158+00
dania alameen	daniaalameen4@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a4eec0ca-5af3-424e-96cd-a9de92116ea5	439	2025-10-13 00:59:17.940809+00
mohammad shorman	mohd079999854@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fc1f80cd-6e44-4c92-9150-3be2d2e90f4d	440	2025-10-13 01:04:26.039491+00
natalie salem	alnabernatalie@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fe47551f-9e9d-498e-9ba0-e0c9156d34f8	423	2025-10-13 00:21:39.184504+00
runa aamodi	Runa_a@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	57309fa7-e754-427e-a76f-310fdf8c462c	442	2025-10-13 01:17:49.894051+00
sondos abusamra	integumentary2001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	050859fb-2ab7-4bfa-945f-cc99fdb8115f	443	2025-10-13 01:18:37.87805+00
ghassan gharibeh	al.graibeh2010@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8298a97b-a914-4eee-9301-d22756a85da0	445	2025-10-13 01:20:22.75879+00
omar kewan	Kamelbaker25@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c3ab8a76-cf40-4d2e-a80c-289d6041efc8	446	2025-10-13 01:21:26.058729+00
falak mohamad	Fkaj6410@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4e21cf35-2b94-4b05-9853-5b4c66cef4a7	455	2025-10-15 16:06:15.608177+00
husam abumarar	husam1973ahmad@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ce0e7f1d-0061-4ae1-9a74-771fe2d490df	448	2025-10-13 01:23:00.132132+00
bashar yeiha	bashared2002@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	eb8715a2-07ae-494f-afc2-4b65c4be7f73	424	2025-10-13 00:35:19.402705+00
rania abusadeh	Raniabaker01@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d2f1decf-0af8-4b61-befa-4dfc075433ae	450	2025-10-13 01:27:55.416172+00
leena alenazi	dr.leenaalenezy12997@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	13fc2df9-a4ab-406a-a042-e6959e6692a4	451	2025-10-13 01:28:43.610311+00
aya henawi	ayawj2000@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2ac09fc0-a6c0-4305-88bc-f4da51b38078	452	2025-10-13 01:29:17.011254+00
kareem khalaf	Kareemkhalaf443@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a1d30117-bd75-4b65-8210-2dbd1b50c789	397	2025-10-12 23:12:55.489107+00
Maryam Alaa	mariam0almahameed@gmail.com	0775060179	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	332540e6-002c-40ab-88fd-504e3e65c149	453	2025-10-14 16:09:48.208327+00
zeyad aljamal	zeyadaljamal2001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1ef15743-1dfb-427d-afae-a5b88da176fd	332	2025-09-30 19:11:33.657916+00
Jasmine elfaqir	Jasmineelfaqir@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	82cf27ae-e81b-4b05-9faa-01dc38fc67b9	456	2025-10-18 11:18:58.034718+00
fkaj6410@gmail.com	fkaj6410@gmail.com	+962776714956	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	47f7830c-1977-4132-86de-87db3bdb1159	454	2025-10-14 17:45:12.096196+00
eman Swetat	Swetateman@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5fcecc6f-3281-431d-96c3-4a7ff7b99700	402	2025-10-12 23:41:13.201997+00
Batool alshereef	batoollshrf@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2d74079d-a629-4ace-bb9e-1ddcdaafdda4	518	2025-11-26 15:45:50.56611+00
rawan ehab	rawanehab7@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6b0df93a-461f-4898-95f9-e3673093ff72	507	2025-11-08 02:25:31.134709+00
mai abdulaziz	Mai_abdulnabi01@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5872cbd9-30d2-4540-9bf0-5761cba10050	460	2025-10-26 19:34:45.801535+00
raneem ryalat	RaneemRyalat2020@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	19447e14-b055-43ca-9188-131c7ea67e22	479	2025-10-31 23:56:48.534935+00
mai ahmad	Doctormay996@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	eec4faa6-f2b8-4893-8aee-33527a1ce91f	464	2025-10-27 17:11:27.942793+00
sh0595634515@gmail.com	sh0595634515@gmail.com	+972595634515	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	657202b1-89f2-47f8-9d91-a9d80a30f4d5	517	2025-11-24 15:14:04.518051+00
ghaith aldaboubi	ghaithaldaboubi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9533b8aa-d163-4765-b97d-617e4b8f8473	466	2025-10-27 17:46:28.343621+00
tala hani	talohani2021@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	77384006-ccd6-4234-b4b4-917bf3740927	512	2025-11-11 17:26:28.519697+00
Rania alimari	Raniaalimari764@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	57a5e29a-6108-4072-b86b-5fead6169e12	476	2025-10-30 19:26:49.564252+00
qias bishara	qias.bishara99@gamil.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d9fc5210-66f7-4c9a-ba10-2015e72de6d7	477	2025-10-31 23:21:19.826883+00
Hiba Shatnawi	Shatnawi.hiba@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	208d078e-346b-4b99-9c4d-b021dc8271f1	504	2025-11-01 15:06:20.882237+00
salma damour	salmadomour20@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f922d916-908d-4d8b-b98a-5c3bd3801faa	462	2025-10-26 19:59:52.713024+00
talalegende@gmail.com	talalegende@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a28b517b-fc1b-4a53-8ec1-afb621c3201b	471	2025-10-30 13:01:11.477257+00
mohammad ali	Mm966mmm@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bdf88f0c-4e90-4b0b-a8f0-36156eb37b47	497	2025-11-01 02:47:20.865542+00
sarah alkhaldi	salkhaldi554@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	24f6ed1e-5078-4974-a47c-a200b120c463	474	2025-10-30 13:11:33.679309+00
faleh ahmad	falehahmad3@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7eaf622e-d0c3-4f4b-8d3d-369d95829e32	481	2025-11-01 01:23:50.092902+00
batool khatatbeh	Khatatbeh.batool18@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	74ff3205-f404-4bf8-8718-5bbde92633f4	486	2025-11-01 01:36:45.292556+00
zahra alnakkas	z.alnakkas98@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cd386828-42d1-4706-986c-79bd198ac833	482	2025-11-01 01:29:54.196992+00
mohammad albadri	Mkalbadri92@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7b2f294e-3dc8-469a-9d9c-2cd636cc2c5d	483	2025-11-01 01:34:15.973766+00
nour albayati	dr.nour.albayati@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2de6d402-a0c4-4ff7-97f9-21e405b70ac2	473	2025-10-30 13:10:49.324161+00
moumen almatarneh	dr.thebest2000@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	00a2b58d-42b4-42c4-9139-82abb0b953cf	506	2025-11-03 17:17:02.353022+00
kamar khlaileh	Kamar.69.kh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bf38c2f0-986f-4b62-890a-d7ad703cb5f5	487	2025-11-01 01:37:21.9664+00
Mohammad Farraj	Mohammadfarraj.993@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	47639333-ead0-4e45-850f-ef5d31bc081c	488	2025-11-01 01:38:02.491297+00
rahaf sweity	rahafsweity9920@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4e037b67-6d13-4522-b887-e5e0b4a9a720	465	2025-10-27 17:44:21.55766+00
lana hanai	Lana-hanai@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c572b8f8-f01b-4d0a-bbfd-ad479c264253	491	2025-11-01 01:39:51.546767+00
qais salman	Qaissalman73@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0e264f6f-24c0-4f6b-8a01-9d1290051363	492	2025-11-01 01:40:51.286437+00
farah albalwa	Dr.farah.balwa@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c5c28dfc-913c-4efe-902b-7cd535aa62ab	493	2025-11-01 02:35:24.677353+00
farah allaboun	Farah87318@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9b648695-2f69-4043-a8e4-d9aa68d8fa82	494	2025-11-01 02:37:29.310012+00
haneen nawwas	haneennawwas@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1bc8d024-7542-432f-b5ee-0baebf308d44	495	2025-11-01 02:44:48.884889+00
salsabeel alomari	alomarisalsabeel999@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	011b0959-7a37-447c-9773-e6966770c3f4	499	2025-11-01 03:10:07.761879+00
razan awartani	razan.wow.s@gmail.com	+972598000200	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8cf0a227-8953-4518-b2b4-1f0975cfc56b	510	2025-11-10 12:08:06.348471+00
sarah alsheyyab.s.17@gmail.com yyab		\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8cb0d2d5-2030-420a-ae51-6834f040c4cb	500	2025-11-01 12:52:17.044868+00
hadia mohammad	hma12350@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3b6bd45b-e4ea-4e4a-814f-875a9b9af58a	463	2025-10-26 20:17:11.492697+00
tasnim hussien	drtasnim.ahmad@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	665585f5-f361-4899-a9c5-786bd5f5f2ba	502	2025-11-01 13:10:05.740236+00
hanan alqaisi	hananalqaisi85@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f635d8a5-ec46-4de0-9630-c35603318152	457	2025-10-19 14:19:11.555063+00
rahaf alqrna	rahafn741@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9a7b84ca-614b-43a9-9428-80b7abf3f387	484	2025-11-01 01:35:36.234582+00
ibrahim aloqaily	ibrahim.aloqaily76@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d396d0f1-d44d-495f-8447-2513fbaf56d5	511	2025-11-11 14:09:22.256922+00
makram ahmad	makramtaani5@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	38576b46-8eb1-4068-9ff0-dc6aecb09754	498	2025-11-01 02:52:00.455685+00
mohammad abusini	mohammadnsini96@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5d7f11ba-4d74-4d5f-91eb-133dfb6f1680	459	2025-10-23 13:55:05.820062+00
slehatleen@gmail.com	slehatleen@gmail.com	0788609950	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	69924c89-29db-4a77-9033-671262b46785	516	2025-11-19 13:14:03.825619+00
bayan thainat	thainatbayan@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6fabbd25-009b-439f-b9de-dd834793c0f7	461	2025-10-26 19:41:15.562499+00
lama hajji	Lamahijji@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4e9d9682-9444-42a9-9c75-3cea5f991c47	490	2025-11-01 01:39:09.213839+00
Rawan abuhammour	Rawanabuhammour15@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a40832ba-ec6d-4bfe-9214-05f8d7ba7702	475	2025-10-30 15:29:02.650418+00
yazan rashdan	Yazan.rashdan@icloud.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cbb7930e-5419-41b1-8993-e84cbe4c7c14	468	2025-10-27 18:55:30.689976+00
Dalia Obeidat	obeidatdalia@gmail.com	0791819057	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	91470618-872c-4d4f-bdfe-a269e17d9c35	513	2025-11-13 14:39:04.098476+00
diala hussain	dialahussain13@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	76997380-eaa8-48ef-892d-5d1d28b4537f	469	2025-10-27 18:56:08.378587+00
Lina Burghal	linaburghal@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	89bb51f6-16ee-4bf3-8406-ecb3c3ac17b1	458	2025-10-19 18:06:30.852373+00
yasmeen alomary	yas2190872@yahoo.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7b62c69c-887d-4c50-b157-9e3620b7fa91	501	2025-11-01 13:07:38.349405+00
mesk alkhateeb	Alkhateebmesk@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8ee6ead4-aa04-48c1-b133-9ab05dc9a292	467	2025-10-27 17:49:10.091322+00
marah makableh	marah.makableh2001@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dfeac66a-e0c4-427b-931f-68a4ffcb66aa	407	2025-10-12 23:44:37.218604+00
razan haddad	razanhaddad2001q@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8f4b3325-4d69-481c-9a55-f893160d55bd	496	2025-11-01 02:45:27.966183+00
mahran zreqe	mahran.zreqe@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5d526136-cc59-4cad-aa80-65ee6af0ca89	547	2025-12-21 18:55:09.64384+00
batoolkhaleed8@gmail.com	batoolkhaleed8@gmail.com	0771926124	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9b759ec3-baf9-4289-bada-9281bf2b3cae	564	2026-01-29 15:32:03.363895+00
bashar0404@hotmail.com	bashar0404@hotmail.com	+972503312362	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a3c86e15-1415-4c5f-b263-5e63ab213df8	536	2025-12-08 13:06:41.292706+00
Gshs Hshs	idrisjaradat12345678@gmail.com	0775132403	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	91824ea2-5041-4196-983e-e3578a582726	565	2026-01-31 21:07:33.777178+00
test test	testtest@gmail.com	111111111111	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3bb506e5-7923-40aa-8436-4b35926d6199	545	2025-12-19 11:36:29.09766+00
magedaboallaban2@gmail.com	magedaboallaban2@gmail.com	0611178830	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0b18aa1b-5451-4f3f-af46-f683c1817d63	523	2025-11-29 17:13:58.671186+00
علا عبدالله	olaabutailkh@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	00a540a5-1a2a-4cd3-b1ba-9a8702db0893	543	2025-12-12 19:23:22.630404+00
Yosra romi	yosra1272002@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	588863d4-cf20-4f4c-b685-2ae52ed46efe	546	2025-12-21 18:11:20.780744+00
Enas Ahmad	nesoahm172@gmail.com	0788475671	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c53297d1-c2c0-4bf8-93b4-99b75a6a271d	540	2025-12-09 13:22:49.60691+00
psg.2003@hotmail.com	psg.2003@hotmail.com	+96598044322	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	364d3220-d72f-4588-ae1a-ef3e38a429f4	554	2026-01-17 12:03:28.776546+00
yasmeen jalloud	yasmeen.jalloud@gmail.com	+972598672067	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8227439f-4ab4-42bc-b65e-fbb8767d2292	559	2026-01-23 12:48:19.812613+00
eme.roro.2001@gmail.com	eme.roro.2001@gmail.com	0797207818	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d8f21c6a-1b17-4dbb-bdf5-1c35364b9e39	538	2025-12-08 13:42:07.574457+00
layanchair@gmail.com	layanchair@gmail.com	0796255628	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1fc1cb56-7fb4-430f-9f9e-03e518762d38	553	2026-01-16 14:11:45.922429+00
Sraj Gbes	srajgbes2004@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1c27c067-0f64-4434-b062-b220e0ab1dc6	575	2026-02-08 20:46:41.657931+00
Youssef Nassar	youssefnassar51@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b4a2f323-6d7b-4cec-b2d3-3060e966b80b	551	2026-01-10 15:03:54.831996+00
رغد جهاد	raghad.aqsa2021@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c4d09494-9d79-401e-9e99-08b0c4614daf	522	2025-11-28 18:08:08.331281+00
معاذ ابو عرار	mooad.arar16@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	9f54bec0-0410-47aa-80b3-43bd466597d9	558	2026-01-22 18:17:03.960928+00
مريانا القيسي	maryanaqaisi@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	4fe2dd13-dd95-4e89-b447-617acb36c3eb	542	2025-12-10 10:33:24.501962+00
msatoof44@gmail.com	msatoof44@gmail.com	0790067832	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a5774810-dfc5-4c56-a182-1a84c37b80ab	573	2026-02-07 23:39:23.252681+00
mahmoud38039@gmail.com	mahmoud38039@gmail.com	01008561318	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	79b627cc-e321-4c86-a2df-65665fdbf3ff	560	2026-01-23 20:07:56.578965+00
bashar		\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	50dcd4fd-27c8-4ef9-9806-373716e44361	570	2026-02-02 15:43:59.530634+00
Amir Adel	amiradel077@gmail.com	+201200330054	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d15c0bb1-745d-42f2-8fcd-8338b4ddbdd3	571	2026-02-04 10:54:28.793894+00
Mina Farah	minafarahzakhers@gmail.com	01275178563	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ce96b05a-e1be-432d-a689-29c4aaa7cc64	572	2026-02-04 18:13:46.7399+00
tatianaabuwandi@gmail.com	tatianaabuwandi@gmail.com	0790887576	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	18837c1b-0ea1-4d54-8f65-83a812b14b97	539	2025-12-09 05:35:10.447472+00
نايف الخزاعلة	naeyff55@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e4933a4b-bc8b-41b7-9c1a-40e9155d7b38	521	2025-11-26 18:26:04.623015+00
omran abuhazeem	abuhazeem_o@yahoo.com	0795078581	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7c573433-565f-4272-8d5d-3eed23fe7bfd	535	2025-12-03 08:12:39.659406+00
ايمان خليل	emankhalil971@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	849b1983-7400-4bbd-a253-636b13593900	541	2025-12-10 10:00:11.089925+00
Mubarak Alali	mbkal3li@gmail.com	0790088407	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7e8096ab-8569-4b5f-b359-35b5889423b3	578	2026-02-09 13:32:28.349946+00
alnomiratjoury@gmail.com	alnomiratjoury@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3acf596c-0e01-4db1-b7e5-be43331cc9e0	580	2026-02-10 14:01:16.289749+00
d8639178@gmail.com	d8639178@gmail.com	01553633929	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1ff7859f-55af-41da-88c3-70c60a5e0eec	552	2026-01-15 13:11:56.835214+00
Abdulkareem  Ababneh	kareemababneh5@gmail.com	0781394327	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	34ac428b-851d-43d3-82b8-1456a0eb01f3	582	2026-02-11 19:54:59.952673+00
tala alhaj	hsnsaly867@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fefe09f2-0b9b-450d-aebe-5bcace1cd4bd	583	2026-02-13 17:08:04.82769+00
Fouz Faisal	foozmarf511@gmail.com	0541137875	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	eeb6d33e-673d-4d20-9f9a-d4e98fe6c9d8	584	2026-02-14 08:50:08.581471+00
sujood adam	sujoodsalih95@gamil.com	00974095719	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6f9a076f-cba3-412d-b06e-c3e60857c54a	607	2026-04-07 13:47:45.073071+00
halashaban26@gmail.com	halashaban26@gmail.com	0799815946	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e0f692b7-eb73-459b-9981-eff3a4ecfabd	632	2026-06-18 14:41:11.010311+00
leenalhamaideh@gmail.com	leenalhamaideh@gmail.com	0790129798	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	272f7306-bc30-4ae6-bd93-52a7349ef3c0	595	2026-03-02 13:58:49.152435+00
gabriella moussa	gabriellamoussa5@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8567d321-0e7d-4dea-bd17-52683bbee984	610	2026-04-16 08:35:47.961786+00
hallla12377@gmail.com	hallla12377@gmail.com	0796485507	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d087470f-4bcb-4910-ab91-20e2a5ab1842	586	2026-02-18 10:25:22.432553+00
Rola Braka	rolabraka2005@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	820e4141-f3c4-4dc7-9cd0-9ee5b997b63b	602	2026-03-27 13:40:31.30437+00
LUJAIN ALREJOUB	lujainnomar@gmail.com	+962797562282	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e733d455-f202-4382-a0a9-f5cc378d1ccc	620	2026-05-15 04:55:15.617792+00
Layal Badir	layalbadir2007@gmail.com	Layal2007	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	0dda5355-98cb-4de0-b68b-c309bb9ac625	629	2026-06-12 17:04:31.967637+00
malakad2992005@gmail.com	malakad2992005@gmail.com	+972599500680	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	70e98fbd-205c-4454-a810-792c499d51d5	606	2026-04-07 12:46:41.213432+00
Lyly Nasr	lylynasr05@gmail.com	+201141137212	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	07eb4dab-c2d7-4ccf-bf50-9b5c06da403a	608	2026-04-15 21:10:43.233936+00
hessah aljalahma	dr.hessahaljalahma@hotmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ad35e178-9ad2-4d39-8850-612aadbbef5c	598	2026-03-16 06:14:19.73523+00
amalshorman22@gmail.com	amalshorman22@gmail.com	0798935101	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	226c5b70-022b-427e-9ba1-09580d2f81fe	591	2026-02-19 21:23:14.678462+00
lawrence.abujbara@gmail.com	lawrence.abujbara@gmail.com	0796277904	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	01f2b531-e9ea-4bdf-b930-3a6ca6d0a077	593	2026-02-22 16:40:59.18512+00
hasanjairoudy031@gmail.com	hasanjairoudy031@gmail.com	0965286636	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bbcbd7c7-53d3-4dea-b4b9-001366624de3	589	2026-02-19 17:08:04.628035+00
Sama Mohamed	samamoahmed8@gmail.com	010323913177	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6d1f0a8b-d15f-4c77-99e4-38234c749f42	609	2026-04-16 00:43:39.34707+00
Haidar Abdulrasoul	thehaidar2005@gmail.com	799207174	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	98bbcbc9-ef39-42df-9c7c-a7289e64a577	617	2026-04-27 08:31:49.787708+00
شششش ذذيلا	bb@bb.com	799999999	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2cd0c269-b729-4c74-a53d-2b1f48637150	623	2026-05-19 14:39:12.169791+00
فرح زعرب	farahhamoda16@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1dcee5c1-9040-462a-878e-f27a7216eaf2	600	2026-03-20 10:16:22.707036+00
linasulaiman16@gmail.com	linasulaiman16@gmail.com	+40725188201	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	442da886-596b-44e4-a0e7-9b41b496e93a	599	2026-03-16 09:21:50.83485+00
Shuhd Ali	shuhd.has@icloud.com	00000000	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	756a40c2-ae3c-458d-bf50-90a1d0306aea	611	2026-04-23 03:17:43.755492+00
rami.essamoh102@gmail.com	rami.essamoh102@gmail.com	+60145742651	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6ee59aa1-05b9-492c-a288-2ea239cac457	614	2026-04-25 13:07:08.981621+00
belalsaed536@gmail.com	belalsaed536@gmail.com	0506455504	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	6317f38e-29dd-4354-a36f-de727cfb7f2a	587	2026-02-19 09:04:24.281542+00
qusyqudah231@gmail.com	qusyqudah231@gmail.com	+995599918298	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	bed1b6bc-4c47-42a1-87ed-53229fb7fd10	618	2026-04-30 20:29:18.036232+00
Khaled Rafeh	ka.raf@hotmail.com	+962797346258	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	df2720ac-a4cb-4781-9be9-6d87bdf9f6a9	621	2026-05-18 00:40:01.610831+00
faisalbalasimsalman2@gmail.com	faisalbalasimsalman2@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	95c1b13f-0d6f-444b-9cae-d4f6a88c7331	568	2026-02-02 11:40:06.392608+00
basharalmalki77@gmail.com	basharalmalki77@gmail.com	+963935056101	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	28471037-87c7-4100-b2df-70c14151d3c2	604	2026-03-30 14:29:49.562958+00
Abdalla  Sabra	bsbrh87@gmail.com	01068748754	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8e01baa8-a332-4fee-8301-2a1d941a70e5	631	2026-06-17 16:09:51.858472+00
Bassem Alshaer	basem3904@gmail.com	+201091070274	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d34ddc1f-9b76-4bdf-9dd7-608b38dfc4cb	619	2026-05-09 08:28:48.631765+00
anxjjj@gmail.com	anxjjj@gmail.com	+96555004771	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3c6f2933-33db-4c8d-a550-9de7941cbc35	615	2026-04-25 18:06:33.675865+00
jannat aldulaimi	jannataldulaimi7@gmail.com	0778226017	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	da05d0d2-31f8-472e-be93-995dcc56c537	627	2026-06-07 19:47:37.123216+00
alsaffar313@gmail.com	alsaffar313@gmail.com	0096599328911	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c0ea3c46-b3e3-41d7-a664-10ef85566efd	634	2026-06-19 18:57:38.074346+00
sarahbmnaser@gmail.com	sarahbmnaser@gmail.com	+995 511 169 776	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	c042bf52-f0ee-4669-afdf-ba311a35eb08	613	2026-04-23 13:47:50.702291+00
leen131@icloud.com	leen131@icloud.com	0797297765	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	250eaee5-cbfc-4270-8752-25b40a1bdfe3	588	2026-02-19 14:49:10.586662+00
mayasura2000@gmail.com	mayasura2000@gmail.com	0797330551	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	7fff9d76-9650-4e25-86b3-e6806f9c4067	597	2026-03-12 19:27:08.434499+00
hebaokour177@gmail.com	hebaokour177@gmail.com	+962790470935	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	03788d78-f917-44a3-80bb-331240bac2f2	605	2026-04-06 12:13:04.358724+00
musabzghoul27@gmail.com	musabzghoul27@gmail.com	+962770261999	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	3bb61f3d-a611-4a56-8875-983a47450427	622	2026-05-18 13:24:27.255057+00
aon.almohammad@gmail.com	aon.almohammad@gmail.com	0798867489	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e8ad3678-9a6a-48f2-92d6-86d8eed267ac	625	2026-05-31 18:55:28.335793+00
sharifmedic1@gmail.com	sharifmedic1@gmail.com	0504419496	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	e3299966-0990-4448-93c1-1533abe9e5e6	636	2026-06-21 13:36:41.237129+00
mostafakhateeb12@gmail.com	mostafakhateeb12@gmail.com	0795490619	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	5585cdd6-f4c0-49ca-bd05-70247d170338	647	2026-07-01 07:26:55.030066+00
jaafreheslam7@gmail.com	jaafreheslam7@gmail.com	0791871330	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	d1ebeddb-1755-4c25-ab17-c8061bf3177a	646	2026-06-30 10:15:42.626587+00
yznlswlmh@gmail.com	yznlswlmh@gmail.com	0509979322	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	19dfa4dc-446e-4030-b613-51637f484239	653	2026-07-05 17:53:49.543924+00
Raed Madieh	madiehraed8@gmail.com	\N	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	1fb61a04-cec6-4d8c-ac40-b3cad6d5e0e8	638	2026-06-23 10:26:54.76644+00
etaywi@gmail.com	etaywi@gmail.com	0779753726	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	cba15466-59fe-48c7-aa75-3e85b769fa23	663	2026-07-16 06:15:35.988396+00
basmaabusafia15@gmail.com	basmaabusafia15@gmail.com	0597894393	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	150c4863-9762-46b1-923b-18b844cfccc8	658	2026-07-12 10:23:00.575268+00
mohammadfreihat1382004@gmail.com	mohammadfreihat1382004@gmail.com	0775181234	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dd8ce0f8-20a9-4997-821f-3e035bcb29cd	590	2026-02-19 20:50:40.323142+00
calathari@gmail.com	calathari@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	03ec8b57-d96d-4fbd-b2dc-f229f69e2091	650	2026-07-01 13:42:09.618769+00
sanadq91@gmail.com	sanadq91@gmail.com	965+55727888	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	940f682c-9381-4cb8-b261-6522cf9b4efa	651	2026-07-03 18:50:49.019254+00
Raya Alkhashab	rayaalkhashab@gmail.com	00962798778692	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	2ab2d97c-575c-42a9-a663-e157b03243f3	642	2026-06-25 14:45:43.878001+00
Esmat  al-Ghoul	bqmqb132@gmail.com	0595157517	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	aaf1c1d3-b58c-405a-a193-f09f00ea7996	649	2026-07-01 13:14:18.801823+00
mfh20030523@gmail.com	mfh20030523@gmail.com	+96597705858	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	49a00354-e9fd-4deb-93f2-37620e939d70	637	2026-06-22 16:50:55.405694+00
brawy003@gmail.com	brawy003@gmail.com	00962776307443	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	db515283-fe82-4841-8a40-df1303de3096	667	2026-07-22 13:41:41.591043+00
baddo.rtrt90@gmail.com	baddo.rtrt90@gmail.com	0773 166 9114	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ff9ae89f-447a-4561-aef0-7b37d3a7f940	662	2026-07-15 07:36:12.633133+00
mayaralkaraki2006@gmail.com	mayaralkaraki2006@gmail.com	0 7 8265 0020	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	21170bd3-4269-4ae8-a01f-ccf79fa1b09e	648	2026-07-01 13:03:24.635306+00
mohammad.kurdi199@gmail.com	mohammad.kurdi199@gmail.com	0771288817	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	03335946-20d0-4d71-a06a-32cdd434f7ab	643	2026-06-27 14:04:36.830598+00
maryamhashush@gmail.com	maryamhashush@gmail.com		Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	334ae5fe-9a96-4fc7-97f9-0ed1b3f66526	639	2026-06-23 14:21:28.006236+00
danaa2288@gmail.com	danaa2288@gmail.com	0790019371	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	fd27a466-258f-4e5e-b60f-a1ed49762eb5	668	2026-07-27 10:25:58.211398+00
saifeabdulsalam@gmail.com	saifeabdulsalam@gmail.com	+962781066376	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	097422d2-27c7-47ea-82c8-9947828106b2	664	2026-07-19 13:49:20.210115+00
rose.mkaldy80@gmail.com	rose.mkaldy80@gmail.com	0504062001	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	ddc074e8-2286-471e-bfc8-3434ef2a38fe	645	2026-06-29 10:20:03.608789+00
mlk.methkaal@gmail.com	mlk.methkaal@gmail.com	0799536545	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	dcfdca64-5f9e-459e-b643-97611f7d55be	640	2026-06-23 16:53:24.745766+00
amarashwi5@gmail.com	amarashwi5@gmail.com	0781080272	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	a7c90c10-ee29-4320-9c0b-c11aa4b24b68	669	2026-07-28 14:46:27.305204+00
bassemaalqaisi84@gmail.com	bassemaalqaisi84@gmail.com	0792680258	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	b81b2f6c-08c4-456f-9b9c-7c4005bea7a3	655	2026-07-06 14:51:28.348266+00
Sarah khamaiseh	sarahkhamaiseh8@gmail.com	00962791486030	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8a7e6396-298b-45ae-bc1b-e8418901fa6f	644	2026-06-27 16:52:13.571549+00
Ahmed sabry	ss7546824@gmail.com	+201098583817	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	760b4281-1384-4376-b219-d9495f30c74a	671	2026-08-01 16:29:22.445915+00
Yazan  Ibrahim	yazanmed67@gmail.com	0795333278	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	8c389a02-7dc2-4095-9295-969a3e973f90	672	2026-08-01 19:41:01.488043+00
samialborsan@gmail.com	samialborsan@gmail.com	0781762341	Student	blank.png	\N	\N	\N	\N	\N	\N	\N	\N	f013db3d-bd6a-4b47-aafc-1089db3bbf6b	665	2026-07-21 11:57:31.688124+00
`;

async function migrateStudents() {
  const lines = rawData.split('\n').filter(line => line.trim() !== '');
  const studentsToInsert = [];

  for (const line of lines) {
    const columns = line.split('\t');
    const status = columns[3];

    // الفلترة: الطلاب فقط (سيتجاهل الـ Admin مثل triplesacademy)
    if (status === 'Student') {
      studentsToInsert.push({
        name: columns[0] === '\\N' ? null : columns[0],
        email: columns[1],
        username: columns[1], // استخدمنا الإيميل كـ username لضمان عدم التكرار
        password: 'password123!', // سيتم تشفيرها تلقائياً بفضل الـ hook
        phone: columns[2] === '\\N' ? null : columns[2],
        status: status,
        image_profile: columns[4] === '\\N' ? 'blank.png' : columns[4],
        shortBio: columns[5] === '\\N' ? null : columns[5],
        detail: columns[6] === '\\N' ? null : columns[6],
        github: columns[7] === '\\N' ? null : columns[7],
        youtube: columns[8] === '\\N' ? null : columns[8],
        twitter: columns[9] === '\\N' ? null : columns[9],
        facebook: columns[10] === '\\N' ? null : columns[10],
        instagram: columns[11] === '\\N' ? null : columns[11],
        linkedin: columns[12] === '\\N' ? null : columns[12],
        uuid: columns[13] === '\\N' ? null : columns[13],
        createdAt: new Date(columns[15].replace('+00', 'Z')), // تحويل الوقت للصيغة الصحيحة
        updatedAt: new Date(columns[15].replace('+00', 'Z'))
      });
    }
  }

  try {
    // إدخال البيانات دفعة واحدة 
    // استخدام individualHooks ضروري لتشغيل الباسورد هاش لكل مستخدم
    await User.bulkCreate(studentsToInsert, { individualHooks: true });
    console.log(`تم إدخال ${studentsToInsert.length} طالب بنجاح!`);
  } catch (error) {
    console.error('حدث خطأ أثناء إدخال البيانات:', error);
  }
}

migrateStudents();