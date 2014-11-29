cbmjslib
========

This is a JavaScript implementation of the "Call by Meaning" programming model for automated
semantic discovery and data adaption as described in paper:
http://www.hesam.us/callbymeaning/

Instructions
========

In order to use CbMJS library first launch Cyc and its interface server:

1) Obtain ResearchCyc (placed in a directory, say $CYCDIR):

	http://www.cyc.com/platform/researchcyc

2) Obtain the following jar files and place in lib/jar/:

   javax.servlet-5.1.11.jar
   servlet-api-3.0.jar
   jetty-http-9.0.6.v20130930.jar
   websocket-api-9.0.6.v20130930.jar
   jetty-io-9.0.6.v20130930.jar
   websocket-client-9.0.6.v20130930.jar
   jetty-server-9.0.6.v20130930.jar
   websocket-common-9.0.6.v20130930.jar
   jetty-util-9.0.6.v20130930.jar
   websocket-server-9.0.6.v20130930.jar
   opencyc-4.0-nighthawk.145797.jar
   websocket-servlet-9.0.6.v20130930.jar

3) Build Java based Cyc API CycI.java by running:

        $ cd lib/cyc
	$ mkdir classes
	$ ./build-cyci.sh

4) In one terminal run Cyc:

      	$ cd $CYCDIR/server/cyc/run/bin/ ; ./run-cyc.sh


5) Load the extra Call-by-Meaning ontology into base Cyc KB by following steps:
   a. Open up the Cyc browser in your web browser by noting the URL given in the terminal 
      where you ran step (4) above, seen on line saying "Connect via URL ..." 
   b. Log in as "CycAdministrator".
   c. On top pane click on Tools > Navigator > Load KE File   
   d. Enter full pathname: "$HERE/lib/cyc/cbm-cyc-kb.ke" and click on "Load File".
   e. Click on "Add Forms to Agenda".
   
6) In another terminal run CycI interface server:

	$ ./run-cyci.sh

API (package: cbm.KB)
========

	addComponent(object)

add object to KB repository

    findByName(name)

find an object in KB repository with the name of <name>

     findByAPIName(name)

find an object in KB repository having a property named <name>

     findByMeaning(query, asker, onFound)

object <asker> asks the KB to find an object in repository matching with query <query> and 
callback <onFound> function(foundObject) { ... } to be invoked on response

	 askByMeaning(query, isBoolean, onReturn, asker, askee)

object <asker> asks the KB query <query> about object <askee> and callback <onReturn> 
function(answer) { ... } is invoked on response. <isBoolean> boolean value says whether
(if true) this is a "yes/no" question or (if false) asking for a dictionary model as 
the answer
