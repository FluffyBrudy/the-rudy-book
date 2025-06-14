--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: rudy
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO rudy;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: rudy
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: reaction_type_enum; Type: TYPE; Schema: public; Owner: rudy
--

CREATE TYPE public.reaction_type_enum AS ENUM (
    'thumbup',
    'angry',
    'sad',
    'funny',
    'care',
    'heart'
);


ALTER TYPE public.reaction_type_enum OWNER TO rudy;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comment; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.comment (
    comment_id integer NOT NULL,
    comment_body text NOT NULL,
    post_id integer NOT NULL,
    commenter_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    udpated_at timestamp without time zone DEFAULT now() NOT NULL,
    image_url text NOT NULL,
    username character varying(50) NOT NULL
);


ALTER TABLE public.comment OWNER TO rudy;

--
-- Name: comment_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: rudy
--

CREATE SEQUENCE public.comment_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_comment_id_seq OWNER TO rudy;

--
-- Name: comment_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudy
--

ALTER SEQUENCE public.comment_comment_id_seq OWNED BY public.comment.comment_id;


--
-- Name: comment_reply; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.comment_reply (
    comment_reply_id integer NOT NULL,
    parent_comment_id integer NOT NULL,
    reply_content text NOT NULL,
    replied_by_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    udpated_at timestamp without time zone DEFAULT now() NOT NULL,
    username character varying(50) NOT NULL,
    image_url text NOT NULL
);


ALTER TABLE public.comment_reply OWNER TO rudy;

--
-- Name: comment_reply_comment_reply_id_seq; Type: SEQUENCE; Schema: public; Owner: rudy
--

CREATE SEQUENCE public.comment_reply_comment_reply_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comment_reply_comment_reply_id_seq OWNER TO rudy;

--
-- Name: comment_reply_comment_reply_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudy
--

ALTER SEQUENCE public.comment_reply_comment_reply_id_seq OWNED BY public.comment_reply.comment_reply_id;


--
-- Name: media_content; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.media_content (
    media_content_id integer NOT NULL,
    media_url text NOT NULL,
    post_id integer NOT NULL
);


ALTER TABLE public.media_content OWNER TO rudy;

--
-- Name: media_content_media_content_id_seq; Type: SEQUENCE; Schema: public; Owner: rudy
--

CREATE SEQUENCE public.media_content_media_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_content_media_content_id_seq OWNER TO rudy;

--
-- Name: media_content_media_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudy
--

ALTER SEQUENCE public.media_content_media_content_id_seq OWNED BY public.media_content.media_content_id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    notification_info text NOT NULL,
    notification_on_type character varying(15) NOT NULL,
    notification_on_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid NOT NULL,
    CONSTRAINT chk_notification_on_type CHECK (((notification_on_type)::text = ANY ((ARRAY['post'::character varying, 'comment'::character varying, 'reply'::character varying, 'friend_request'::character varying, 'friend_req_accept'::character varying, 'reaction'::character varying])::text[])))
);


ALTER TABLE public.notification OWNER TO rudy;

--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: rudy
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_id_seq OWNER TO rudy;

--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudy
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.post (
    post_id integer NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp(0) with time zone DEFAULT now(),
    updated_at timestamp(0) with time zone DEFAULT now() NOT NULL,
    username character varying(50) NOT NULL,
    image_url text NOT NULL
);


ALTER TABLE public.post OWNER TO rudy;

--
-- Name: post_post_id_seq; Type: SEQUENCE; Schema: public; Owner: rudy
--

CREATE SEQUENCE public.post_post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_post_id_seq OWNER TO rudy;

--
-- Name: post_post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudy
--

ALTER SEQUENCE public.post_post_id_seq OWNED BY public.post.post_id;


--
-- Name: reaction; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.reaction (
    reactor_id uuid NOT NULL,
    reaction_on_type character varying(255) NOT NULL,
    reaction_on_id integer NOT NULL,
    reaction_type character varying(255) NOT NULL,
    image_url text NOT NULL,
    username character varying(50) NOT NULL,
    CONSTRAINT reaction_reaction_on_type_check CHECK (((reaction_on_type)::text = ANY ((ARRAY['comment'::character varying, 'reply'::character varying, 'post'::character varying])::text[]))),
    CONSTRAINT reaction_reaction_type_check CHECK (((reaction_type)::text = ANY ((ARRAY['thumbup'::character varying, 'sad'::character varying, 'angry'::character varying, 'care'::character varying, 'heart'::character varying, 'funny'::character varying])::text[])))
);


ALTER TABLE public.reaction OWNER TO rudy;

--
-- Name: text_content; Type: TABLE; Schema: public; Owner: rudy
--

CREATE TABLE public.text_content (
    text_content_id integer NOT NULL,
    content text NOT NULL,
    post_id integer NOT NULL
);


ALTER TABLE public.text_content OWNER TO rudy;

--
-- Name: text_content_text_content_id_seq; Type: SEQUENCE; Schema: public; Owner: rudy
--

CREATE SEQUENCE public.text_content_text_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.text_content_text_content_id_seq OWNER TO rudy;

--
-- Name: text_content_text_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rudy
--

ALTER SEQUENCE public.text_content_text_content_id_seq OWNED BY public.text_content.text_content_id;


--
-- Name: comment comment_id; Type: DEFAULT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.comment ALTER COLUMN comment_id SET DEFAULT nextval('public.comment_comment_id_seq'::regclass);


--
-- Name: comment_reply comment_reply_id; Type: DEFAULT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.comment_reply ALTER COLUMN comment_reply_id SET DEFAULT nextval('public.comment_reply_comment_reply_id_seq'::regclass);


--
-- Name: media_content media_content_id; Type: DEFAULT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.media_content ALTER COLUMN media_content_id SET DEFAULT nextval('public.media_content_media_content_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: post post_id; Type: DEFAULT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.post ALTER COLUMN post_id SET DEFAULT nextval('public.post_post_id_seq'::regclass);


--
-- Name: text_content text_content_id; Type: DEFAULT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.text_content ALTER COLUMN text_content_id SET DEFAULT nextval('public.text_content_text_content_id_seq'::regclass);


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.comment (comment_id, comment_body, post_id, commenter_id, created_at, udpated_at, image_url, username) FROM stdin;
1	this is comment	23	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-10 21:13:26.997821	2025-06-10 21:13:26.997821	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
3	this is another comment	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-10 21:15:10.490099	2025-06-10 21:15:10.490099	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
6	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:38:44.322623	2025-06-14 17:38:44.322623	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
7	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:40:36.302052	2025-06-14 17:40:36.302052	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
8	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:45:22.166369	2025-06-14 17:45:22.166369	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
9	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:45:51.350431	2025-06-14 17:45:51.350431	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
10	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:48:14.956017	2025-06-14 17:48:14.956017	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
11	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:48:57.339178	2025-06-14 17:48:57.339178	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
12	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 17:52:59.594112	2025-06-14 17:52:59.594112	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
13	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:04:45.499484	2025-06-14 18:04:45.499484	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
14	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:05:01.077539	2025-06-14 18:05:01.077539	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
15	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:05:43.447804	2025-06-14 18:05:43.447804	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
16	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:07:03.438272	2025-06-14 18:07:03.438272	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
17	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:09:41.9302	2025-06-14 18:09:41.9302	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
18	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:10:05.65442	2025-06-14 18:10:05.65442	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
19	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:11:07.750062	2025-06-14 18:11:07.750062	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
20	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:13:05.471232	2025-06-14 18:13:05.471232	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
21	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:14:24.037812	2025-06-14 18:14:24.037812	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
22	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:15:04.375973	2025-06-14 18:15:04.375973	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
23	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:15:38.956161	2025-06-14 18:15:38.956161	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
24	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:15:46.540346	2025-06-14 18:15:46.540346	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
25	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:17:05.417196	2025-06-14 18:17:05.417196	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
26	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:18:59.105773	2025-06-14 18:18:59.105773	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
27	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:20:16.403577	2025-06-14 18:20:16.403577	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
28	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:20:45.455936	2025-06-14 18:20:45.455936	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
29	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:21:18.205603	2025-06-14 18:21:18.205603	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
30	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:24:31.987842	2025-06-14 18:24:31.987842	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
31	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:24:44.040347	2025-06-14 18:24:44.040347	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
32	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 18:25:19.716094	2025-06-14 18:25:19.716094	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
33	hello	21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 21:13:49.893789	2025-06-14 21:13:49.893789	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
\.


--
-- Data for Name: comment_reply; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.comment_reply (comment_reply_id, parent_comment_id, reply_content, replied_by_id, created_at, udpated_at, username, image_url) FROM stdin;
1	1	ohoho reply aho baka	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-11 21:39:01.379952	2025-06-11 21:39:01.379952	apple	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg
2	1	ohoho reply aho baka	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 21:18:32.926343	2025-06-14 21:18:32.926343	apple	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg
\.


--
-- Data for Name: media_content; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.media_content (media_content_id, media_url, post_id) FROM stdin;
5	https://duckduckgo.com/i/36897d4397b4d629.png	20
6	https://duckduckgo.com/i/36897d4397b4d629.png	21
7	https://duckduckgo.com/i/36897d4397b4d629.png	22
8	https://duckduckgo.com/i/36897d4397b4d629.png	23
9	https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.tLotgCDtzgTdwJcTiXWRCwHaEK%3Fpid%3DApi&f=1&ipt=0f9318c4c15efd3f1f41638c0643befe5f06618bc4e8474451edce6e1d107d39&ipo=images	24
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.notification (id, notification_info, notification_on_type, notification_on_id, created_at, user_id) FROM stdin;
1	apple commented on your post	post	21	2025-06-14 17:38:44.331694+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
2	apple commented on your post	post	21	2025-06-14 17:40:36.319375+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
3	apple commented on your post	post	21	2025-06-14 17:45:22.186142+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
4	apple commented on your post	post	21	2025-06-14 17:45:51.366538+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
5	apple commented on your post	post	21	2025-06-14 17:48:14.966889+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
6	apple commented on your post	post	21	2025-06-14 17:48:57.356887+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
7	apple commented on your post	post	21	2025-06-14 17:52:59.60642+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
8	apple commented on your post	post	21	2025-06-14 18:04:45.509818+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
9	apple commented on your post	post	21	2025-06-14 18:05:01.089652+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
10	apple commented on your post	post	21	2025-06-14 18:05:43.465551+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
11	apple commented on your post	post	21	2025-06-14 18:07:03.457828+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
12	apple commented on your post	post	21	2025-06-14 18:09:41.96047+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
13	apple commented on your post	post	21	2025-06-14 18:10:05.667759+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
14	apple commented on your post	post	21	2025-06-14 18:11:07.760313+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
15	apple commented on your post	post	21	2025-06-14 18:13:05.506376+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
16	apple commented on your post	post	21	2025-06-14 18:14:24.05083+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
17	apple commented on your post	post	21	2025-06-14 18:15:04.387873+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
18	apple commented on your post	post	21	2025-06-14 18:15:38.977298+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
19	apple commented on your post	post	21	2025-06-14 18:15:46.547662+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
20	apple commented on your post	post	21	2025-06-14 18:17:05.449968+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
21	apple commented on your post	post	21	2025-06-14 18:18:59.131371+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
22	apple commented on your post	post	21	2025-06-14 18:20:16.414368+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
23	apple commented on your post	post	21	2025-06-14 18:20:45.466689+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
24	apple commented on your post	post	21	2025-06-14 18:21:18.229335+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
25	apple commented on your post	post	21	2025-06-14 18:24:31.998559+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
26	apple commented on your post	post	21	2025-06-14 18:24:44.049751+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
27	apple commented on your post	post	21	2025-06-14 18:25:19.731502+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
28	apple has a new post.	post	24	2025-06-14 21:13:13.426626+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
29	apple has a new post.	post	24	2025-06-14 21:13:13.455396+05:45	370175ae-37d1-4574-9c24-cd75a4c3f6e4
30	apple has a new post.	post	24	2025-06-14 21:13:13.456488+05:45	922efb07-4e23-49f6-8de2-69131943dedc
31	apple has a new post.	post	24	2025-06-14 21:13:13.457614+05:45	b00313d0-6fad-41f4-a42b-d298d8cc0e2e
32	apple commented on your post	post	21	2025-06-14 21:13:49.932432+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
33	apple reacted on your comment	comment	1	2025-06-14 21:18:04.321719+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
34	apple replied to your comment	comment	1	2025-06-14 21:18:32.936422+05:45	a44f5537-001d-42da-a9e3-a9bb443e7657
\.


--
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.post (post_id, author_id, created_at, updated_at, username, image_url) FROM stdin;
20	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-10 20:37:37+05:45	2025-06-10 20:37:37+05:45	apple	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg
21	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-10 20:37:57+05:45	2025-06-10 20:37:57+05:45	apple	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg
22	370175ae-37d1-4574-9c24-cd75a4c3f6e4	2025-06-10 20:38:09+05:45	2025-06-10 20:38:09+05:45	ball	https://res.cloudinary.com/dlygf7xye/image/upload/v1749567068/pigeon-messanger/ball.svg
23	922efb07-4e23-49f6-8de2-69131943dedc	2025-06-10 20:38:22+05:45	2025-06-10 20:38:22+05:45	cat	https://res.cloudinary.com/dlygf7xye/image/upload/v1749567086/pigeon-messanger/cat.svg
24	a44f5537-001d-42da-a9e3-a9bb443e7657	2025-06-14 21:13:13+05:45	2025-06-14 21:13:13+05:45	apple	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg
\.


--
-- Data for Name: reaction; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.reaction (reactor_id, reaction_on_type, reaction_on_id, reaction_type, image_url, username) FROM stdin;
a44f5537-001d-42da-a9e3-a9bb443e7657	post	20	funny	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
a44f5537-001d-42da-a9e3-a9bb443e7657	comment	1	funny	https://res.cloudinary.com/dlygf7xye/image/upload/v1749404869/pigeon-messanger/apple.svg	apple
\.


--
-- Data for Name: text_content; Type: TABLE DATA; Schema: public; Owner: rudy
--

COPY public.text_content (text_content_id, content, post_id) FROM stdin;
16	appzl	20
17	ballz	21
18	ballz	22
19	catz	23
20	haiya	24
\.


--
-- Name: comment_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudy
--

SELECT pg_catalog.setval('public.comment_comment_id_seq', 33, true);


--
-- Name: comment_reply_comment_reply_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudy
--

SELECT pg_catalog.setval('public.comment_reply_comment_reply_id_seq', 2, true);


--
-- Name: media_content_media_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudy
--

SELECT pg_catalog.setval('public.media_content_media_content_id_seq', 9, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudy
--

SELECT pg_catalog.setval('public.notification_id_seq', 34, true);


--
-- Name: post_post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudy
--

SELECT pg_catalog.setval('public.post_post_id_seq', 24, true);


--
-- Name: text_content_text_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rudy
--

SELECT pg_catalog.setval('public.text_content_text_content_id_seq', 20, true);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (comment_id);


--
-- Name: comment_reply comment_reply_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.comment_reply
    ADD CONSTRAINT comment_reply_pkey PRIMARY KEY (comment_reply_id);


--
-- Name: media_content media_content_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.media_content
    ADD CONSTRAINT media_content_pkey PRIMARY KEY (media_content_id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (post_id);


--
-- Name: reaction reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_pkey PRIMARY KEY (reactor_id, reaction_on_id);


--
-- Name: text_content text_content_pkey; Type: CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.text_content
    ADD CONSTRAINT text_content_pkey PRIMARY KEY (text_content_id);


--
-- Name: idx_comment_post_id; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_comment_post_id ON public.comment USING btree (post_id);


--
-- Name: idx_comment_reply_parent_comment_id; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_comment_reply_parent_comment_id ON public.comment_reply USING btree (parent_comment_id);


--
-- Name: idx_media_content_post_id; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_media_content_post_id ON public.media_content USING btree (post_id);


--
-- Name: idx_reaction_on_type_and_id; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_reaction_on_type_and_id ON public.reaction USING btree (reaction_on_type, reaction_on_id);


--
-- Name: idx_reaction_reaction_on_id; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_reaction_reaction_on_id ON public.reaction USING btree (reaction_on_id);


--
-- Name: idx_reaction_reaction_on_type; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_reaction_reaction_on_type ON public.reaction USING btree (reaction_on_type);


--
-- Name: idx_text_content_post_id; Type: INDEX; Schema: public; Owner: rudy
--

CREATE INDEX idx_text_content_post_id ON public.text_content USING btree (post_id);


--
-- Name: comment comment_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.post(post_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment_reply comment_reply_parent_comment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.comment_reply
    ADD CONSTRAINT comment_reply_parent_comment_id_foreign FOREIGN KEY (parent_comment_id) REFERENCES public.comment(comment_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media_content media_content_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.media_content
    ADD CONSTRAINT media_content_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.post(post_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: text_content text_content_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: rudy
--

ALTER TABLE ONLY public.text_content
    ADD CONSTRAINT text_content_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.post(post_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: rudy
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

