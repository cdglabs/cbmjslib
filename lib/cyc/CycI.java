import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ConnectException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.opencyc.api.CycAccess;
import org.opencyc.api.CycObjectFactory;
import org.opencyc.comm.SocketComm;
import org.opencyc.comm.SocketCommRoundRobin;
import org.opencyc.cycobject.ByteArray;
import org.opencyc.cycobject.CycAssertion;
import org.opencyc.cycobject.CycConstant;
import org.opencyc.cycobject.CycFormulaSentence;
import org.opencyc.cycobject.CycFort;
import org.opencyc.cycobject.CycList;
import org.opencyc.cycobject.CycListParser;
import org.opencyc.cycobject.CycNart;
import org.opencyc.cycobject.CycNaut;
import org.opencyc.cycobject.CycObject;
import org.opencyc.cycobject.CycSymbol;
import org.opencyc.cycobject.CycVariable;
import org.opencyc.cycobject.DefaultCycObject;
import org.opencyc.cycobject.ELMt;
import org.opencyc.cycobject.Guid;
import org.opencyc.inference.InferenceResultSet;
import org.opencyc.inference.params.DefaultInferenceParameters;
import org.opencyc.inference.params.InferenceParameters;
import org.opencyc.util.StringUtils;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.websocket.server.WebSocketHandler;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

import java.io.IOException;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.RemoteEndpoint;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketError;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

@WebSocket
public class CycI {

    // options:
    public static HashMap<String,Integer> Options = new HashMap<String,Integer>();
    static {
	Options.put("BooleanQuery_MaxTransformationDepth", 1);
	Options.put("BooleanQuery_MaxProofDepth", 0);
	Options.put("BooleanQuery_MaxTime", 30);
	Options.put("ValueQuery_MaxTransformationDepth", 1);
	Options.put("ValueQuery_MaxProofDepth", 0);
	Options.put("ValueQuery_MaxTime", 30);
    }
    public static String HostName = "localhost";
    public static int HostPort = 3600;

    int BooleanQuery_MaxTransformationDepth;;
    int BooleanQuery_MaxProofDepth;
    int BooleanQuery_MaxTime;
    int ValueQuery_MaxTransformationDepth;
    int ValueQuery_MaxProofDepth;
    int ValueQuery_MaxTime;

    CycAccess cyc;
    CycFormulaSentence query;
    ELMt mt;
    InferenceParameters queryPropertiesBooleanQuery, queryPropertiesValueQuery;
    RemoteEndpoint client;


    void setOption(String option, String valueString) {
	try { 
	    int value = Integer.parseInt(valueString); 
	    CycI.Options.put(option, value);
	    cyc = null;
	} catch (Exception e) { 
	    System.exit(1);
	}
    }

    void setUp(String queryMt) throws Exception {
	BooleanQuery_MaxTransformationDepth = Options.get("BooleanQuery_MaxTransformationDepth");
	BooleanQuery_MaxProofDepth = Options.get("BooleanQuery_MaxProofDepth");
	BooleanQuery_MaxTime = Options.get("BooleanQuery_MaxTime");
	ValueQuery_MaxTransformationDepth = Options.get("ValueQuery_MaxTransformationDepth");
	ValueQuery_MaxProofDepth = Options.get("ValueQuery_MaxProofDepth");
	ValueQuery_MaxTime = Options.get("ValueQuery_MaxTime");

	cyc = new CycAccess(HostName, HostPort);
	cyc.setCyclist("#$CycAdministrator");
	mt = cyc.makeELMt(queryMt.equals("") ? cyc.everythingPSC : cyc.getKnownConstantByName(queryMt));
	queryPropertiesBooleanQuery = new DefaultInferenceParameters(cyc);
        queryPropertiesBooleanQuery.setMaxNumber(1);
        queryPropertiesBooleanQuery.put(CycObjectFactory.makeCycSymbol(":max-transformation-depth"), BooleanQuery_MaxTransformationDepth);
	if (BooleanQuery_MaxProofDepth > 0)
	    queryPropertiesBooleanQuery.put(CycObjectFactory.makeCycSymbol(":max-proof-depth"), BooleanQuery_MaxProofDepth);
	queryPropertiesBooleanQuery.put(CycObjectFactory.makeCycSymbol(":max-time"), BooleanQuery_MaxTime);
        
	queryPropertiesValueQuery = new DefaultInferenceParameters(cyc);
        queryPropertiesValueQuery.setMaxNumber(1);
        queryPropertiesValueQuery.put(CycObjectFactory.makeCycSymbol(":max-transformation-depth"), ValueQuery_MaxTransformationDepth);
	if (ValueQuery_MaxProofDepth > 0)
	    queryPropertiesValueQuery.put(CycObjectFactory.makeCycSymbol(":max-proof-depth"), ValueQuery_MaxProofDepth);
        queryPropertiesValueQuery.put(CycObjectFactory.makeCycSymbol(":max-time"), ValueQuery_MaxTime);

    }

    void close()  {
	cyc.close();
    }

    InferenceResultSet executeQuery(String querySentence, String queryMt) {
	try {
	    if (cyc == null)
		setUp(queryMt);
	    CycFormulaSentence query = cyc.makeCycSentence(querySentence);
	    InferenceResultSet response = cyc.executeQuery(query, mt, queryPropertiesBooleanQuery, BooleanQuery_MaxTime * 1000);
	    return response;
	} catch (Throwable e) {
	    e.printStackTrace();
	    return null;
	} 
    }

    InferenceResultSet queryVariable(String querySentence, String queryMt) {
	try {
	    if (cyc == null)
		setUp(queryMt);	    
	    //CycFormulaSentence query = cyc.makeCycSentence(querySentence);
	    //CycVariable variable = CycObjectFactory.makeCycVariable("?RETURN");
	    //CycList response = cyc.queryVariable(variable, query, cyc.makeELMt(mt), queryProperties);
	    CycFormulaSentence query = cyc.makeCycSentence(querySentence);
	    InferenceResultSet response = cyc.executeQuery(query, mt, queryPropertiesValueQuery, ValueQuery_MaxTime * 1000);
	    return response;
	} catch (Throwable e) {
	    e.printStackTrace();
	    return null;
	} 
    }

    @OnWebSocketClose
    public void onClose(int statusCode, String reason) {
        System.out.println("Close: statusCode=" + statusCode + ", reason=" + reason);
    }

    @OnWebSocketError
    public void onError(Throwable t) {
        System.out.println("Error: " + t.getMessage());
    }

    @OnWebSocketConnect
    public void onConnect(Session session) {
        System.out.println("Connect: " + session.getRemoteAddress().getAddress());
        // try {
	    client = session.getRemote();
	    //client.sendString("Hello client");
        // } catch (IOException e) {
        //     e.printStackTrace();
        // }
    }

    private String parseModel(String responseString) {
	int i1 = 0;
	int i2 = 0;
	int i3 = 0;
	String res = "";
	String addr = "";
	while (i1 >= 0) {
	    i1 = responseString.indexOf("{?", i3);
	    if (i1 >= 0) {		
		i2 = responseString.indexOf("->", i1);
		i3 = responseString.indexOf("}", i2);
		String varName = responseString.substring(i1+2, i2);
		if (varName.indexOf("TMPVAR") < 0) {
		    String varValue = responseString.substring(i2+2, i3);
		    if (varValue.indexOf("HYP-") < 0) {
			res += addr + varName + ":" + varValue; 
			addr = ",";
		    }
		}
	    }
	}
	return res;
    }

    @OnWebSocketMessage
    public void onMessage(String message) {
	//System.out.println("message: " + message);
	String[] parts = message.split("\\|");
	String command = parts[0];
	String one = parts[1];    
	String two = parts[2];
	if (command.equals("option")) {
	    // an option set
	    System.out.println("set option: " + one + " value: " + two);
	    setOption(one, two);
	} else {
	    // a query
	    String id = one;    
	    String kind = two;
	    boolean isBooleanQuery = kind.equals("boolean");    
	    String queryMt = parts[3];    
	    String query = parts[4];    
	    System.out.println("query id: " + id + " kind: " + kind + " mt: " + queryMt + " query: " + query);
	    long startMilliseconds = System.currentTimeMillis();
	    //HS FIXME	
	    try {
		String answer = "";	    
		InferenceResultSet response;
		if (isBooleanQuery) {
		    response = executeQuery(query, queryMt);
		    String responseString = response.toString();
		    //System.out.println("query id: " + id + " result: " + responseString);
		    boolean isTrue = responseString.equals("true") || response.next(); //HACK FIXME!
		    answer = isTrue ? "true" : "false";
		} else {
		    //FIXME
		    //CycList response = queryVariable(query);
		    //HACK FIXME
		    response = queryVariable(query, queryMt);
		    String responseString = response.toString();
		    //System.out.println("query id: " + id + " result: " + responseString);    
		    try {
			answer = parseModel(responseString);
		    } catch (Exception e) {
			e.printStackTrace();
		    }
		}
		client.sendString(id + "|" + answer);
		long endMilliseconds = System.currentTimeMillis();
		System.out.println("query id: " + id + " answer: " + answer + " elapsed time: " + (endMilliseconds - startMilliseconds) + " ms.\n");    
	    } catch (IOException e) {
		e.printStackTrace();
	    }
	}
    }

    public static void main(String[] args) throws Exception {
        Server server = new Server(8080);
        WebSocketHandler wsHandler = new WebSocketHandler() {
		@Override
            public void configure(WebSocketServletFactory factory) {
		    factory.register(CycI.class);
		}
	    };
        server.setHandler(wsHandler);
        server.start();
        server.join();
    }
}

