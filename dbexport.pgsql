--
-- PostgreSQL database dump
--

-- Dumped from database version 11.7 (Ubuntu 11.7-2.pgdg18.04+1)
-- Dumped by pg_dump version 11.7 (Ubuntu 11.7-2.pgdg18.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: companies_profiles; Type: TABLE; Schema: public; Owner: asim
--

CREATE TABLE public.companies_profiles (
    id integer NOT NULL,
    users_id integer NOT NULL,
    salutation character varying,
    name character varying,
    surname character varying,
    kvk_number integer,
    company_name character varying,
    telephone_number character varying,
    house_number character varying,
    postcode character varying,
    city character varying,
    land character varying,
    photo character varying,
    created_at date,
    updated_at date,
    street character varying
);


ALTER TABLE public.companies_profiles OWNER TO asim;

--
-- Name: companies_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: asim
--

CREATE SEQUENCE public.companies_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_profiles_id_seq OWNER TO asim;

--
-- Name: companies_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asim
--

ALTER SEQUENCE public.companies_profiles_id_seq OWNED BY public.companies_profiles.id;


--
-- Name: endpoints; Type: TABLE; Schema: public; Owner: asim
--

CREATE TABLE public.endpoints (
    id integer NOT NULL,
    path character varying NOT NULL,
    userid integer NOT NULL,
    created_at date,
    updated_at date
);


ALTER TABLE public.endpoints OWNER TO asim;

--
-- Name: endpoint_id_seq; Type: SEQUENCE; Schema: public; Owner: asim
--

CREATE SEQUENCE public.endpoint_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.endpoint_id_seq OWNER TO asim;

--
-- Name: endpoint_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asim
--

ALTER SEQUENCE public.endpoint_id_seq OWNED BY public.endpoints.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: asim
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    users_id integer NOT NULL,
    first_name character varying,
    surname character varying,
    company_name character varying,
    telephone_number character varying,
    street character varying,
    house_number character varying,
    postcode character varying,
    city character varying,
    land character varying,
    photo character varying,
    created_at date,
    updated_at date,
    salutation character varying
);


ALTER TABLE public.user_profiles OWNER TO asim;

--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: asim
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profiles_id_seq OWNER TO asim;

--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asim
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: asim
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying,
    password character varying,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    google_id character varying,
    type character varying
);


ALTER TABLE public.users OWNER TO asim;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: asim
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO asim;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asim
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: companies_profiles id; Type: DEFAULT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.companies_profiles ALTER COLUMN id SET DEFAULT nextval('public.companies_profiles_id_seq'::regclass);


--
-- Name: endpoints id; Type: DEFAULT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.endpoints ALTER COLUMN id SET DEFAULT nextval('public.endpoint_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: companies_profiles; Type: TABLE DATA; Schema: public; Owner: asim
--

COPY public.companies_profiles (id, users_id, salutation, name, surname, kvk_number, company_name, telephone_number, house_number, postcode, city, land, photo, created_at, updated_at, street) FROM stdin;
1	64	mr	asim_company	yilmaz_company	2131231	krona	+90sadjl asn	3123sadas	34100	Istanbul	europa	109868f1602f36509c689dd0b564854e.jpg	2020-05-22	2020-05-22	lkasmdkla
\.


--
-- Data for Name: endpoints; Type: TABLE DATA; Schema: public; Owner: asim
--

COPY public.endpoints (id, path, userid, created_at, updated_at) FROM stdin;
1	/dashboard	1	\N	\N
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: asim
--

COPY public.user_profiles (id, users_id, first_name, surname, company_name, telephone_number, street, house_number, postcode, city, land, photo, created_at, updated_at, salutation) FROM stdin;
11	58	asim	yilmaz	kronaSoftware	+905387721691	Talatpasa Caddesi	\N	\N	Amsterdam	Netherlands	e0e6b10feddc0810e4273a6c1b99c130.png	2020-05-21	2020-05-22	Mevrouw2
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: asim
--

COPY public.users (id, email, password, created_at, updated_at, google_id, type) FROM stdin;
64	asimmurat17@gmail.com	bd1e56722544e6a82d86c880b21ea3d0	2020-05-22	2020-05-22	\N	company
58	asimmu1rat42241117@gmail.com	bd1e56722544e6a82d86c880b21ea3d0	2020-05-21	2020-05-22	\N	client
\.


--
-- Name: companies_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asim
--

SELECT pg_catalog.setval('public.companies_profiles_id_seq', 1, true);


--
-- Name: endpoint_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asim
--

SELECT pg_catalog.setval('public.endpoint_id_seq', 1, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asim
--

SELECT pg_catalog.setval('public.profiles_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asim
--

SELECT pg_catalog.setval('public.users_id_seq', 64, true);


--
-- Name: companies_profiles companies_profiles_pk; Type: CONSTRAINT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.companies_profiles
    ADD CONSTRAINT companies_profiles_pk PRIMARY KEY (id);


--
-- Name: endpoints endpoint_pk; Type: CONSTRAINT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.endpoints
    ADD CONSTRAINT endpoint_pk PRIMARY KEY (id);


--
-- Name: user_profiles profiles_pk; Type: CONSTRAINT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT profiles_pk PRIMARY KEY (id);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: asim
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (id);


--
-- Name: companies_profiles_id_uindex; Type: INDEX; Schema: public; Owner: asim
--

CREATE UNIQUE INDEX companies_profiles_id_uindex ON public.companies_profiles USING btree (id);


--
-- Name: endpoint_id_uindex; Type: INDEX; Schema: public; Owner: asim
--

CREATE UNIQUE INDEX endpoint_id_uindex ON public.endpoints USING btree (id);


--
-- Name: profiles_id_uindex; Type: INDEX; Schema: public; Owner: asim
--

CREATE UNIQUE INDEX profiles_id_uindex ON public.user_profiles USING btree (id);


--
-- Name: users_id_uindex; Type: INDEX; Schema: public; Owner: asim
--

CREATE UNIQUE INDEX users_id_uindex ON public.users USING btree (id);


--
-- Name: users_username_uindex; Type: INDEX; Schema: public; Owner: asim
--

CREATE UNIQUE INDEX users_username_uindex ON public.users USING btree (email);


--
-- PostgreSQL database dump complete
--

