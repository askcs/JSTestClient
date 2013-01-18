package com.askcs.test;

import java.io.IOException;
import javax.servlet.http.*;

@SuppressWarnings("serial")
public class TestClientServlet extends HttpServlet {
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {
		resp.setContentType("text/plain");
		resp.getWriter().println("Ask Test Client");
	}
}
